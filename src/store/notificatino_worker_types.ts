import { FilterOptions } from "../component/Filter"
import { UserNotification, UserTask } from "../interface/typ"

export enum NotificationMessageEventType {
    REQUEST_NOTIFICATION = 'request_notification',
    REQUEST_TASK = 'request_task',
    SEARCH_ALL = 'request_all',
}

export type MessageEventRequestNotification = {
    filter: FilterOptions,
    page: number,
}

export type MessageEventRequestTask = {
    filter: FilterOptions,
    page: number,
}

export type MessageEventSearchAll = {
    filter: FilterOptions,
    keyword: string,
}

export class MessageEvent<T> {
    type: string
    data: T
    identifier: string

    constructor(type: string, data: T) {
        this.type = type
        this.data = data
        this.identifier = Math.random().toString(36).substring(2)
        return this
    }
}

export type MessageEventResponseAll = {
    type: "notification" | "task",
    data: UserNotification | UserTask,
}

export class MessageEventResponse<T> {
    data: T | 'end'
    identifier: string

    constructor(data: T | 'end', identifier: string) {
        this.data = data
        this.identifier = identifier
        return this
    }
}
