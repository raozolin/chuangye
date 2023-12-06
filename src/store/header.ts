import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
    state: () => ({
        title: '',
    }),
    getters: {
        Title(state) {
            return state.title
        }
    },
    actions: {
        setTitle(title: string) {
            this.title = title
        }
    }
})