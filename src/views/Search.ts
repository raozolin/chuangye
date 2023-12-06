import { FilterOptions } from '../component/Filter'
import { UserNotification, UserTask } from '../interface/typ'
import {
    MessageEvent as MyMessageEvent,
    NotificationMessageEventType,
    MessageEventResponse,
    MessageEventSearchAll,
    MessageEventResponseAll
} from '../store/notificatino_worker_types'

import { notificationWorker } from './Notification'

const searchAll = (
    onNotification: (notification: UserNotification) => void,
    onTask: (task: UserTask) => void,
    filter: FilterOptions,
    keyword: string
) => new Promise((resolve) => {
    const message = new MyMessageEvent<MessageEventSearchAll>(
        NotificationMessageEventType.SEARCH_ALL,
        {
            filter: JSON.parse(JSON.stringify(filter)),
            keyword: keyword
        }
    )
    const onMessage = (event: MessageEvent<MessageEventResponse<MessageEventResponseAll>>) => {
        if (event.data.identifier !== message.identifier) {
            return
        }
        if (event.data.data === 'end') {
            notificationWorker.removeEventListener('message', onMessage)
            resolve(0)
            return
        }
        if (event.data.data.type == 'notification') {
            onNotification(event.data.data.data as UserNotification)
        } else if (event.data.data.type == 'task') {
            onTask(event.data.data.data as UserTask)
        }
    }
    notificationWorker.addEventListener('message', onMessage)
    notificationWorker.postMessage(message)
})

export {
    searchAll
}