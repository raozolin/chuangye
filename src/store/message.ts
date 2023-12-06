import { defineStore } from 'pinia'

export type MessageStatistics = {
    count: number,
    type: string,
    name?: string,
    extra?: number,
}

export const useMessageStore = defineStore('message', {
    state: () => ({
        _messages: [] as MessageStatistics[],
    }),
    getters: {
        unreadCount(state) {
            return state._messages.reduce((prev, cur) => {
                return prev + cur.count
            }, 0)
        },
        messages(state) {
            return state._messages.filter((message) => message.count !== 0)
        }
    },
    actions: {
        updateStatistics(statistics: MessageStatistics[]) {
            for (const statistic of statistics) {
                let index = -1
                if (statistic.extra) {
                    index = this._messages.findIndex((message) => message.type === statistic.type && message.extra === statistic.extra)
                } else {
                    index = this._messages.findIndex((message) => message.type === statistic.type)
                }
                if (index !== -1) {
                    this._messages[index].count = statistic.count
                } else {
                    this._messages.push(statistic)
                }
            }
        }
    }
})