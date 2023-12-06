import axios from 'axios'
import { RequestMethods, apiBase } from "./base"
import { loginTokenGet } from '../store/login'
import { Notification, NotificationProfile, Organization, OrganizationMember, User, UserNotification } from './typ'
import { getDeviceId } from '../store/device' 
import { fetchEventSource } from '@microsoft/fetch-event-source'

export const apiNotificationExtractBody = (body: string) => apiBase<{
    times: string[],
    time_extract: {
        start: string,
        end: string
    }
}>('/v1/notification/utils/body_extract', RequestMethods.POST, {
    body
})

export const apiNotificationPublish = (
    title: string, body: string, is_public: boolean, auto_republish: boolean,
    organization_id: number,
    target_organizations: number[], target_users: number[],
    start_at: number, end_at: number,
    priority: number,
    tasks: string,
) => apiBase<{
    success: boolean,
    id: number,
}>('/v1/notification/publish', RequestMethods.POST, {
    title, body, is_public, auto_republish,
    organization_id,
    target_organizations, target_users,
    start_at, end_at,
    priority,
    tasks,
})

const abortController = new AbortController()

export const apiNotificationSync = (
    force: boolean, final_id: number, max_length: number,
    success_callback: (notifications: UserNotification[]) => void,
) => new Promise<{count: number}>(async (resolve, reject) => {
    const { uid, token } = loginTokenGet()
    const baseUrl = (import.meta as any).env.VITE_APP_BACKEND_BASE_URL
    let count = 0
    fetchEventSource(`${baseUrl}/v1/notification/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Billboards-User-Id': uid.toString(),
            'Billboards-User-Token': token || '',
        },
        body: JSON.stringify({
            force, final_id, max_length, device_id: getDeviceId().deviceId
        }),
        onmessage: (resp: any) => {
            const event = resp.event
            const data = resp.data
            switch(event) {
                case 'continue':
                    break
                case 'notification':
                    const notification = JSON.parse(data)
                    success_callback(notification)
                    count += notification.length
                    break
                case 'end':
                    resolve({count: count})
                    break
            }
        },
        openWhenHidden: true,
        // avoid retry
        onerror: (event: any) => {
            reject(event)
            abortController.abort()
        }
    })
})

export const apiNotificationSyncEmpty = () => apiBase<{
    success: boolean
}>('/v1/notification/sync/empty', RequestMethods.POST, {
    device_id: getDeviceId().deviceId
})

export const apiNotificationClick = (nid: number) => apiBase<{
    success: boolean
}>('/v1/notification/click', RequestMethods.POST, {
    nid
})

export const apiNotificationRead = (nid: number) => apiBase<{
    success: boolean
}>('/v1/notification/read', RequestMethods.POST, {
    nid
})

export const apiNotificationConfirm = (nid: number) => apiBase<{
    success: boolean
}>('/v1/notification/confirm', RequestMethods.POST, {
    nid
})

export const apiNotificationView = (nid: number) => apiBase<{
    success: boolean
}>('/v1/notification/view', RequestMethods.POST, {
    nid
})

export const apiNotificationLike = (nid: number) => apiBase<{
    success: boolean
}>('/v1/notification/like', RequestMethods.POST, {
    nid
})

export const apiNotficationProfile = (nid: number) => apiBase<{
    profile: NotificationProfile,
    member: OrganizationMember
}>('/v1/notification/profile', RequestMethods.GET, {
    nid
})

export const apiNotificationList = (organization_id: number, page: number) => apiBase<{
    notifications: Notification[],
    organization: Organization
}>('/v1/notification/list', RequestMethods.GET, {
    organization_id, page
})

export const apiNotificationStatistics = (
    nid: number, load_unread_member: boolean, load_unread_member_page: number,
    load_unconfirmed_member: boolean, load_unconfirmed_member_page: number,
) => apiBase<{
    num_send: number,
    num_read: number,
    num_confirm: number,
    num_view: number,
    num_like: number,
    num_click: number,
    unread: OrganizationMember[],
    unconfirmed: OrganizationMember[],
    notification: Notification,
    task_statistics: {
        done: number,
        task_id: number,
        title: string,
        total: number,
    }[]
}>('/v1/notification/statistics', RequestMethods.GET, {
    nid, load_unread_member, load_unread_member_page,
    load_unconfirmed_member, load_unconfirmed_member_page,
})

export const apiNotificationTaskComplete = (tid: number) => apiBase<{
    success: boolean
}>('/v1/notification/task/complete', RequestMethods.POST, {
    tid
})

export const apiNotificationListPublishedByUser = (page: number) => apiBase<{
    notifications: Notification[],
    total: number,
}>('/v1/notification/published/user', RequestMethods.GET, {
    page
})

export const apiNotificationStatisticsSearchUnread = (
    nid: number, page: number, username: string
) => apiBase<{
    unread: OrganizationMember[],
    total: number,
}>('/v1/notification/statistics/unread/search', RequestMethods.GET, {
    nid, page, username
})

export const apiNotificationStatisticsSearchUnconfirmed = (
    nid: number, page: number, username: string
) => apiBase<{
    unconfirmed: OrganizationMember[],
    total: number,
}>('/v1/notification/statistics/unconfirmed/search', RequestMethods.GET, {
    nid, page, username
})