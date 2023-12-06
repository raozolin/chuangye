import { FilterOptions } from '../component/Filter'
import { UserNotification, UserTask } from '../interface/typ'
import Worker from '../store/notification_worker?worker'
import {
    MessageEvent as MyMessageEvent,
    NotificationMessageEventType,
    MessageEventRequestNotification,
    MessageEventResponse
} from '../store/notificatino_worker_types'

export const notificationWorker = new Worker()

const loadNotification = (
    onLoad: (notification: UserNotification) => void,
    filter: FilterOptions,
    page: number
) => new Promise((resolve) => {
    const message = new MyMessageEvent<MessageEventRequestNotification>(
        NotificationMessageEventType.REQUEST_NOTIFICATION,
        {
            filter: JSON.parse(JSON.stringify(filter)),
            page: page
        }
    )
    const result = [] as UserNotification[]
    const onMessage = (event: MessageEvent<MessageEventResponse<UserNotification | 'end'>>) => {
        if (event.data.identifier !== message.identifier) {
            return
        }
        if (event.data.data === 'end') {
            notificationWorker.removeEventListener('message', onMessage)
            for (const notification of result) {
                onLoad(notification)
            }
            resolve(0)
            return
        }
        result.push(event.data.data)
    }
    notificationWorker.addEventListener('message', onMessage)
    notificationWorker.postMessage(message)
})

const loadTask = (
    onLoad: (task: UserTask) => void,
    filter: FilterOptions,
    page: number
) => new Promise((resolve) => {
    const message = new MyMessageEvent<MessageEventRequestNotification>(
        NotificationMessageEventType.REQUEST_TASK,
        {
            filter: JSON.parse(JSON.stringify(filter)),
            page: page
        }
    )
    const result = [] as UserTask[]
    const onMessage = (event: MessageEvent<MessageEventResponse<UserTask | 'end'>>) => {
        if (event.data.identifier !== message.identifier) {
            return
        }
        if (event.data.data === 'end') {
            notificationWorker.removeEventListener('message', onMessage)
            for (const task of result) {
                onLoad(task)
            }
            resolve(0)
            return
        }
        result.push(event.data.data)
    }
    notificationWorker.addEventListener('message', onMessage)
    notificationWorker.postMessage(message)
})

export {
    loadNotification,
    loadTask
}