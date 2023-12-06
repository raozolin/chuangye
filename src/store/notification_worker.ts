/**
 * About this file
 * Fetch notification from IndexedDB is a heavy task, there are lots of await/async in the code.
 * which means our time slice will be occupied by this task, and the UI especially the scroll bar will be stuck.
 * so we have to move this task to another thread.
 */

import { 
    MessageEvent as MyMessageEvent,
    MessageEventRequestNotification,
    MessageEventRequestTask,
    MessageEventResponse,
    NotificationMessageEventType
} from "./notificatino_worker_types"
import {
    notificationDatabase,
} from '../store/notification'
import { Collection } from 'dexie'
import { UserNotification, UserTask } from "../interface/typ"
import { onSearchAll } from './notification_search'

const onRequestNotification = async (event: MessageEvent<MyMessageEvent<MessageEventRequestNotification>>) => {
    const filter = event.data.data.filter
    const page = event.data.data.page
    const identifier = event.data.identifier

    let collection: Collection<UserNotification, number>

    const now = new Date().getTime()

    if (filter?.organization_id) {
        collection = notificationDatabase.user_notifications.where('organization_id').equals(filter.organization_id)
    } else if (filter?.priority) {
        collection = notificationDatabase.user_notifications.where('priority').aboveOrEqual(filter.priority)
    } else if (filter?.start_at) {
        collection = notificationDatabase.user_notifications.where('start_at').aboveOrEqual(filter.start_at)
    } else if (filter?.end_at) {
        collection = notificationDatabase.user_notifications.where('end_at').aboveOrEqual(now)
    } else if (filter?.sender_role) {
        collection = notificationDatabase.user_notifications.where('sender_role').equals(filter.sender_role)
    } else {
        collection = notificationDatabase.user_notifications.toCollection()
    }

    let already_found = 0
    let already_sent = 0
    let flag_found_new = false

    // pagination
    collection = collection.reverse().offset(0)

    let end_at = filter?.end_at || 1e15
    let start_at = filter?.start_at || 0

    let futureResolve = false
    const awaitFuture = async () => new Promise<boolean>(async (resolve) => {
        while (true) {
            if (futureResolve) {
                resolve(true)
                return
            }
            await new Promise((resolve) => setTimeout(resolve, 100))
        }
    })
    const resolve = () => {
        futureResolve = true
    }

    await collection.until((notification) => {
        // where
        if (notification.start_at > start_at && notification.end_at < end_at) {
            if (filter?.organization_id) {
                if (notification.organization_id !== filter.organization_id) {
                    return false
                }
            }
            if (filter?.priority) {
                if ((notification.notification?.priority || 0) < filter.priority) {
                    return false
                }
            }
            if (filter?.status) {
                switch (filter.status) {
                    case 'read':
                        if (!notification.is_read) {
                            return false
                        }
                        break
                    case 'unread':
                        if (notification.is_read) {
                            return false
                        }
                        break
                    case 'confirmed':
                        if (!notification.is_confirmed) {
                            return false
                        }
                        break
                    case 'unconfirmed':
                        if (notification.is_confirmed) {
                            return false
                        }
                        break
                }
            }
            if (filter?.sender_role) {
                if (notification.sender_role !== filter.sender_role) {
                    return false
                }
            }
        } else {
            return false
        }

        already_found += 1;
        if (already_found <= page * 20) {
            return false
        }

        flag_found_new = true
        setTimeout(async () => {
            if (notification.notification?.organization_id) {
                notification.notification.organization = await notificationDatabase.organizations
                    .where('id').equals(notification.notification.organization_id).first()
            }
            self.postMessage(new MessageEventResponse(notification, identifier))
            already_sent += 1
            if (already_sent === already_found - page * 20) {
                resolve()
            }
        })

        if (already_found == (page + 1) * 20) {
            return true
        }

        return false
    }).toArray()
    
    if (!flag_found_new) {
        resolve()
    }

    await awaitFuture()
    self.postMessage(new MessageEventResponse('end', identifier))
}

const onRequestTask = async (event: MessageEvent<MyMessageEvent<MessageEventRequestTask>>) => {
    const filter = event.data.data.filter
    const page = event.data.data.page
    const identifier = event.data.identifier

    let collection: Collection<UserTask, number>

    const now = new Date().getTime()

    if (filter?.organization_id) {
        collection = notificationDatabase.user_tasks.where('organization_id').equals(filter.organization_id)
    } else if (filter?.start_at) {
        collection = notificationDatabase.user_tasks.where('start_at').aboveOrEqual(filter.start_at)
    } else if (filter?.end_at) {
        collection = notificationDatabase.user_tasks.where('end_at').aboveOrEqual(now)
    } else {
        collection = notificationDatabase.user_tasks.toCollection()
    }

    let already_found = 0
    let already_sent = 0
    let already_end = false

    // pagination
    collection = collection.reverse().offset(0)

    let end_at = filter?.end_at || 1e15
    let start_at = filter?.start_at || 0

    let futureResolve: (value: boolean) => void
    const future = async () => new Promise<boolean>((resolve) => {
        futureResolve = resolve
    })

    await collection.until((task) => {
        // where
        if (task.start_at > start_at && task.end_at < end_at) {
            if (filter?.organization_id) {
                if (task.organization_id !== filter.organization_id) {
                    return false
                }
            }
            if (filter?.status) {
                switch (filter.status) {
                    case 'notdone':
                        if (task.is_done) {
                            return false
                        }
                        break
                    case 'done':
                        if (!task.is_done) {
                            return false
                        }
                        break
                }
            }
        } else {
            return false
        }

        already_found += 1;
        if (already_found <= page * 20) {
            return false
        }

        setTimeout(async () => {
            if (task.organization_id) {
                task.organization = await notificationDatabase.organizations
                    .where('id').equals(task.organization_id).first()
            }
            self.postMessage(new MessageEventResponse(task, identifier))
            already_sent += 1
            if (already_sent === already_found - page * 20) {
                if (typeof futureResolve === 'undefined') {
                    return
                }
                futureResolve(true)
            }
        })

        if (already_found == (page + 1) * 20) {
            already_end = true
            setTimeout(async () => {
                await future()
                self.postMessage(new MessageEventResponse('end', identifier))
            })
            return true
        }

        return false
    }).toArray()

    if (!already_end) {
        self.postMessage(new MessageEventResponse('end', identifier))
    }
}

self.onmessage = (event: MessageEvent<MyMessageEvent<any>>) => {
    switch (event.data.type) {
        case NotificationMessageEventType.REQUEST_NOTIFICATION:
            onRequestNotification(event)
            break
        case NotificationMessageEventType.REQUEST_TASK:
            onRequestTask(event)
            break
        case NotificationMessageEventType.SEARCH_ALL:
            onSearchAll(event)
            break
    }
}