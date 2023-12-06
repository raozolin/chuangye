import { useUserStore } from '../../store/user' 
import { loginTokenGet } from '../../store/login'
import { useMessageStore } from '../../store/message'
import { newSystemNotification } from '../../utils/native'

class Response<T = any> {
    type: string | undefined
    data: T | undefined
}

var globalMessageSocket: MessageSocket | undefined

class MessageSocket {
    private socket!: WebSocket

    private onNewNotificationCallback: (() => void)[]

    constructor() {
        this.onNewNotificationCallback = []
    }

    public close() {
        if (this.socket && this.socket.OPEN) {
            this.socket.close()
        }
    }

    public refresh() {
        this.close()
        const { uid, token } = loginTokenGet()
        if (uid == 0 || token == null) {
            return
        }

        try {
            // if globalMessageSocket is not undefined, close it
            if (globalMessageSocket) {
                globalMessageSocket.close()
            }
            this.socket = new WebSocket(`${(import.meta as any).env.VITE_APP_MESSAGE_BASE_URL}/v1/message`)
            globalMessageSocket = this
            this.socket.onopen = () => {
                this.socket.send(JSON.stringify({
                    uid,
                    token,
                }))
            }
            this.socket.onmessage = (event) => {
                this.messageHandler(event.data)
            }
            this.socket.onclose = () => {
                const { UserOnline } = useUserStore()
                if(!UserOnline) {
                    return
                }
                setTimeout(() => {
                    console.log('[MessageSocket] reconnect')
                    this.refresh()
                }, 1000)
            }
        } catch(e) {
            console.log(e)
        }
    }

    public messageHandler(message: string) {
        // convert message to json
        const messageJson = JSON.parse(message)
        // parse message
        const response = new Response()
        Object.assign(response, messageJson)
        switch (response.type) {
            case 'heartbeat':
                this.handleHeartbeat()
                break
            case 'new_notification':
                this.handleNewNotification(response.data)
                break
            case 'new_organization_join_apply':
                this.handleNewOrganizationJoinApply(response.data)
                break
            case 'new_organization_join_apply_accepted':
                this.handleNewOrganizationJoinApplyAccepted(response.data)
                break
            case 'new_organization_join_apply_rejected':
                this.handleNewOrganizationJoinApplyRejected(response.data)
                break
        }
    }

    public handleHeartbeat() {
        this.socket.send(JSON.stringify({
            type: 'heartbeat',
        }))
    }

    public handleNewNotification(data: {
        oid: number,
        count: number,
    }) {
        const messageStore = useMessageStore()
        messageStore.updateStatistics([{
            type: 'notification',
            count: data.count,
        }])
        if (data.count !== 0) {
            this.onNewNotificationCallback.forEach((cb) => cb())
            newSystemNotification('有新通知', '点击查看')
        }
    }

    public handleNewOrganizationJoinApply(data: {
        oid: number,
        name: string,
        count: number,
    }) {
        const messageStore = useMessageStore()
        messageStore.updateStatistics([{
            type: 'organization_join_apply',
            name: data.name,
            count: data.count,
            extra: data.oid,
        }])
        if (data.count !== 0) {
            newSystemNotification(`组织加入申请`, `有新成员申请加入${data.name}`)
        }
    }

    public handleNewOrganizationJoinApplyAccepted(data: {
        oid: number,
        name: string,
        count: number,
    }) {
        const messageStore = useMessageStore()
        messageStore.updateStatistics([{
            type: 'organization_join_apply_accepted',
            name: data.name,
            count: data.count,
            extra: data.oid,
        }])
        if (data.count !== 0) {
            newSystemNotification(`组织加入申请已通过`, `你加入${data.name}的申请已通过`)
            const userStore = useUserStore()
            userStore.refresh()
        }
    }

    public handleNewOrganizationJoinApplyRejected(data: {
        oid: number,
        name: string,
        count: number,
    }) {
        const messageStore = useMessageStore()
        messageStore.updateStatistics([{
            type: 'organization_join_apply_rejected',
            name: data.name,
            count: data.count,
            extra: data.oid,
        }])
        if (data.count !== 0) {
            newSystemNotification(`组织加入申请已拒绝`, `你加入${data.name}的申请已拒绝`)
        }
    }

    public readNotification() {
        this.socket.send(JSON.stringify({
            type: 'read_notifications',
        }))
    }

    public readOrganizationJoinApply(oid: number) {
        this.socket.send(JSON.stringify({
            type: 'read_organization_join_apply',
            data: oid.toString()
        }))
    }

    public readOrganizationJoinApplyAccepted(oid: number) {
        this.socket.send(JSON.stringify({
            type: 'read_organization_join_apply_accepted',
            data: oid.toString()
        }))
    }

    public readOrganizationJoinApplyRejected(oid: number) {
        this.socket.send(JSON.stringify({
            type: 'read_organization_join_apply_rejected',
            data: oid.toString()
        }))
    }

    public onNewNotification(callback: () => void) {
        this.onNewNotificationCallback.push(callback)
    }

    public offNewNotification(callback: () => void) {
        const index = this.onNewNotificationCallback.findIndex((cb) => cb === callback)
        if (index !== -1) {
            this.onNewNotificationCallback.splice(index, 1)
        }
    }
}

export const messageController = new MessageSocket()