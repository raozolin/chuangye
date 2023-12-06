import { UserNotification, UserTask } from '../interface/typ'
import {
    MessageEvent as MyMessageEvent,
    MessageEventResponse,
    MessageEventSearchAll,
    MessageEventResponseAll
} from '../store/notificatino_worker_types'
import { Collection } from 'dexie'
import { notificationDatabase } from '../store/notification'

export const onSearchAll = async (event: MessageEvent<MyMessageEvent<MessageEventSearchAll>>) => {
    const filter = event.data.data.filter
    const identifier = event.data.identifier
    const keyword = event.data.data.keyword

    let collection: Collection<UserTask, number>

    if (filter?.organization_id) {
        collection = notificationDatabase.user_tasks.where('organization_id').equals(filter.organization_id)
    } else if (filter?.start_at) {
        collection = notificationDatabase.user_tasks.where('start_at').aboveOrEqual(filter.start_at)
    } else if (filter?.end_at) {
        collection = notificationDatabase.user_tasks.where('end_at').belowOrEqual(filter.end_at)
    } else {
        collection = notificationDatabase.user_tasks.toCollection()
    }

    // pagination
    collection = collection.reverse().offset(0)

    let end_at = filter?.end_at || 1e15
    let start_at = filter?.start_at || 0

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
            if (keyword) {
                if (!task.task.title.includes(keyword) && !task.task.body.includes(keyword)) {
                    return false
                }
            }
        } else {
            return false
        }

        setTimeout(async () => {
            if (task.organization_id) {
                task.organization = await notificationDatabase.organizations
                    .where('id').equals(task.organization_id).first()
            }
            self.postMessage(new MessageEventResponse<MessageEventResponseAll>(
                {
                    type: 'task',
                    data: task
                },
                identifier
            ))
        })
        return false
    }).toArray()

    // search notification
    let collection2: Collection<UserNotification, number>

    if (filter?.organization_id) {
        collection2 = notificationDatabase.user_notifications.where('organization_id').equals(filter.organization_id)
    } else if (filter?.start_at) {
        collection2 = notificationDatabase.user_notifications.where('start_at').aboveOrEqual(filter.start_at)
    } else if (filter?.end_at) {
        collection2 = notificationDatabase.user_notifications.where('end_at').belowOrEqual(filter.end_at)
    } else {
        collection2 = notificationDatabase.user_notifications.toCollection()
    }

    // pagination
    collection2 = collection2.reverse().offset(0)

    await collection2.until((notification) => {
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

            if (keyword) {
                if (!notification.notification?.title.includes(keyword) && !notification.notification?.body.includes(keyword)) {
                    return false
                }
            }
        } else {
            return false
        }

        setTimeout(async () => {
            if (notification.notification?.organization_id) {
                notification.notification.organization = await notificationDatabase.organizations
                    .where('id').equals(notification.notification.organization_id).first()
            }
            self.postMessage(new MessageEventResponse<MessageEventResponseAll>(
                {
                    type: 'notification',
                    data: notification
                },
                identifier
            ))
        })
        return false
    }).toArray()

    setTimeout(() => {
        self.postMessage(new MessageEventResponse('end', identifier))
    }, 100)
}