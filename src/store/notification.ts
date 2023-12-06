import Dexie, { Table, liveQuery } from 'dexie'
import { Notification, Organization, Task, User, UserNotification, UserTask } from '../interface/typ'
import { Ref, ref, watch } from 'vue'
// @ts-ignore
import { useObservable } from '@vueuse/rxjs'
import { apiNotificationSync } from '../interface/notification'
import { useUserStore } from './user'

type SenderRole = {
    name: string
}

class NotificationDatabase extends Dexie {
    public notifications!: Table<Notification, number>
    public tasks!: Table<Task, number>
    public user_notifications!: Table<UserNotification, number>
    public user_tasks!: Table<UserTask, number>
    public organizations!: Table<Organization, number>
    public sender_roles!: Table<SenderRole, string>

    public constructor() {
        super("NotificationDatabase")
        this.version(1).stores({
            notifications: "id, organization_id, start_at, end_at, priority",
            tasks: "id, organization_id, notification_id, [start_at+end_at]",
            user_notifications: "id, notification_id, start_at, end_at, organization_id, priority, is_read, is_confirmed",
            organizations: "id",
            user_tasks: "id, user_id, task_id, organization_id, notification_id, user_notification_id, start_at, end_at, is_done",
        })
        this.version(3).stores({
            notifications: "id, organization_id, start_at, end_at, priority",
            tasks: "id, organization_id, notification_id, [start_at+end_at]",
            user_notifications: "id, notification_id, start_at, end_at, organization_id, priority, is_read, is_confirmed, sender_role",
            organizations: "id",
            user_tasks: "id, user_id, task_id, organization_id, notification_id, user_notification_id, start_at, end_at, is_done",
            sender_roles: "name",
        })
    }
}

export const notificationDatabase = new NotificationDatabase()

export const useNotificationStatistics = () => {
    const unread = useObservable(
        liveQuery(async () => {
            return await notificationDatabase.user_notifications.where('is_read').equals(1).count()
        })
    ) as Ref<number>
    const unconfirmed = useObservable(
        liveQuery(async () => {
            return await notificationDatabase.user_notifications.where('is_confirmed').equals(0).count()
        })
    ) as Ref<number>
    const undone = useObservable(
        liveQuery(async () => {
            return await notificationDatabase.user_tasks.where('is_done').equals(0).count()
        })
    ) as Ref<number>

    return {
        unread,
        unconfirmed,
        undone
    }
}

export const useNotificationSenderRoles = () => {
    const sender_roles = useObservable(
        liveQuery(async () => {
            return await notificationDatabase.sender_roles.toArray()
        })
    ) as Ref<SenderRole[]>

    return {
        sender_roles
    }
}

export const refreshOrganizationNotificationStatistics = async () => {
    const organizations = await notificationDatabase.organizations.toArray()

    const userStore = useUserStore()

    for (const organization of organizations) {
        const notifications = await notificationDatabase.user_notifications
            .where('organization_id').equals(organization.id)
            .toArray()
        let unconfirmed = 0
        let undone = 0
        for (const notification of notifications) {
            if (notification.is_confirmed === 0) {
                unconfirmed += 1
            }
            const tasks = await notificationDatabase.user_tasks
                .where('notification_id').equals(notification.notification_id)
                .toArray()
            for (const task of tasks) {
                if (task.is_done === 0) {
                    undone += 1
                }
            }
        }
        userStore.setUserOrganizationUnconfirmed(organization.id, unconfirmed)
        userStore.setUserOrganizationUnDone(organization.id, undone)
    }
}

export const useNotificationDetail = (id: number) => {
    const user_notification = useObservable(
        liveQuery(async () => {
            return await notificationDatabase.user_notifications.get(id)
        })
    ) as Ref<UserNotification>
    const notification = ref<Notification>()
    const tasks = ref<UserTask[]>()
    const organization = ref<Organization>()
    watch(user_notification, async value => {
        if(value) {
            notification.value = await notificationDatabase.notifications
                .get(value.notification_id)
            tasks.value = await notificationDatabase.user_tasks.
                where('notification_id').equals(value.notification_id).toArray()
            organization.value = await notificationDatabase.organizations
                .get(notification.value?.organization_id || 0)
        }
    })

    return {
        user_notification,
        notification,
        tasks,
        organization
    }
}

export const syncNotification = async (start_callback: () => void = () => {}, force: boolean = false) => {
    // check last sync time
    const lastSyncTime = localStorage.getItem('lastSyncTime')
    if (!force && lastSyncTime && new Date().getTime() - Number(lastSyncTime) < 1000 * 60 * 3) {
        return 0
    }

    // start sync
    start_callback()

    const sum = { count: 0 }

    await new Promise(async resolve => {
        let syncing = 0

        await apiNotificationSync(false, -1, 5000, async (notifications) => {
            syncing += 1
            for (const notification of notifications) {
                // check if the user notification is already in the databse
                const localUserNotification = await notificationDatabase.user_notifications
                    .where('notification_id').equals(notification.notification_id).first()
                if (localUserNotification) {
                    // update
                    notificationDatabase.user_notifications.update(localUserNotification.id, {
                        notification_id: notification.notification_id,
                        user_id: notification.user_id,
                        is_read: notification.is_read ? 1 : 0,
                        is_confirmed: notification.is_confirmed ? 1 : 0,
                        notification: notification.notification,
                        start_at: new Date(notification.notification?.start_at || 0).getTime() || 0,
                        end_at: new Date(notification.notification?.end_at || 0).getTime() || 0,
                        organization_id: notification.notification?.organization_id || -1,
                        tasks: notification.tasks || [],
                    })
                } else {
                    // insert
                    notificationDatabase.user_notifications.put({
                        id: notification.id,
                        notification_id: notification.notification_id,
                        user_id: notification.user_id,
                        is_read: notification.is_read ? 1 : 0,
                        is_confirmed: notification.is_confirmed ? 1 : 0,
                        from: notification.from,
                        notification: notification.notification,
                        start_at: new Date(notification.notification?.start_at || 0).getTime() || 0,
                        end_at: new Date(notification.notification?.end_at || 0).getTime() || 0,
                        organization_id: notification.notification?.organization_id || -1,
                        priority: notification.notification?.priority || 0,
                        tasks: notification.tasks || [],
                        sender_role: notification.notification?.sender_role || '',
                    })
                    sum.count += 1

                    // check if role is already in the database
                    const localSenderRole = await notificationDatabase.sender_roles
                        .where('name').equals(notification.notification?.sender_role || '').first()
                    if (!localSenderRole) {
                        notificationDatabase.sender_roles.put({
                            name: notification.notification?.sender_role || '',
                        })
                    }
                }
        
                // check if the notification is already in the database
                const localNotification = await notificationDatabase.notifications
                    .where('id').equals(notification.notification_id).first()
                if (localNotification) {
                    // update
                    notificationDatabase.notifications.update(localNotification.id, {
                        id: notification.notification_id,
                        title: notification.notification?.title,
                        body: notification.notification?.body,
                        start_at: notification.notification?.start_at,
                        end_at: notification.notification?.end_at,
                        organization_id: notification.notification?.organization_id,
                    })
                } else {
                    // insert
                    notificationDatabase.notifications.put({
                        id: notification.notification_id,
                        title: notification.notification?.title || '无标题',
                        body: notification.notification?.body || '无内容',
                        start_at: new Date(notification.notification?.start_at || 0).getTime() || 0,
                        end_at: new Date(notification.notification?.end_at || 0).getTime() || 0,
                        organization_id: notification.notification?.organization_id || -1,
                        sender_uid: notification.notification?.sender_uid || -1,
                        organization: notification.notification?.organization || undefined,
                        permission: notification.notification?.permission || 0,
                        priority: notification.notification?.priority || 0,
                        attchments: notification.notification?.attchments || [],
                        flag: notification.notification?.flag || 0,
                        created_at: notification.notification?.created_at || '',
                        updated_at: notification.notification?.updated_at || '',
                        sender_role: notification.notification?.sender_role || '',
                    })
                }

                // update tasks
                for (const task of notification.tasks || []) {
                    // check if already in the database
                    const localTask = await notificationDatabase.user_tasks
                        .where('task_id').equals(task.id).first()
                    if (localTask) {
                        notificationDatabase.user_tasks.update(localTask.id, {
                            id: task.id,
                            notification_id: notification.notification_id,
                            organization_id: notification.notification?.organization_id || -1,
                            user_notification_id: notification.id,
                            start_at: new Date(task.task.start_at || 0).getTime() || 0,
                            end_at: new Date(task.task.end_at || 0).getTime() || 0,
                            created_at: task.created_at,
                            updated_at: task.updated_at,
                            task: task.task,
                            is_done: task.is_done ? 1 : 0,
                        })
                    } else {
                        notificationDatabase.user_tasks.put({
                            user_id: task.user_id,
                            task_id: task.task_id,
                            id: task.id,
                            notification_id: notification.notification_id,
                            organization_id: notification.notification?.organization_id || -1,
                            user_notification_id: notification.id,
                            start_at: new Date(task.task.start_at || 0).getTime() || 0,
                            end_at: new Date(task.task.end_at || 0).getTime() || 0,
                            created_at: task.created_at,
                            updated_at: task.updated_at,
                            task: task.task,
                            is_done: task.is_done ? 1 : 0,
                        })
                    }

                    // check if the task is already in the database
                    const localTask2 = await notificationDatabase.tasks
                        .where('id').equals(task.id).first()
                    if (localTask2) {
                        // update
                        notificationDatabase.tasks.update(localTask2.id, {
                            id: task.task.id,
                            notification_id: task.notification_id,
                            organization_id: task.organization_id,
                            start_at: new Date(task.task.start_at || 0).getTime() || 0,
                            end_at: new Date(task.task.end_at || 0).getTime() || 0,
                            created_at: task.created_at,
                            updated_at: task.updated_at,
                        })
                    } else {
                        // insert
                        notificationDatabase.tasks.put({
                            id: task.task.id,
                            notification_id: notification.notification_id,
                            organization_id: notification.notification?.organization_id || -1,
                            start_at: new Date(task.task.start_at || 0).getTime() || 0,
                            end_at: new Date(task.task.end_at || 0).getTime() || 0,
                            created_at: task.task.created_at,
                            updated_at: task.task.updated_at,
                            title: task.task.title,
                            body: task.task.body,
                            publisher_uid: task.task.publisher_uid,
                            publisher: task.task.publisher,
                        })
                    }
                }
            }
            syncing -= 1
        })

        // wait for all sync finished
        while (syncing > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        resolve(0)
    })

    // update last sync time
    localStorage.setItem('lastSyncTime', new Date().getTime().toString())

    return sum.count
}

// delete all notifications dose not belong to the user
export const cleanRedundancyNotification = async (uid: number) => {
    const notifications = await notificationDatabase.user_notifications.toArray()
    for (const notification of notifications) {
        if (notification.user_id !== uid) {
            await notificationDatabase.user_notifications.delete(notification.id)
        }
    }

    const tasks = await notificationDatabase.user_tasks.toArray()
    for (const task of tasks) {
        if (task.user_id !== uid) {
            await notificationDatabase.user_tasks.delete(task.id)
        }
    }
}
