import { RequestMethods, apiBase } from "./base";
import { Organization } from "./typ";

export const apiUserCheck = <T>() => apiBase<T>('/v1/user/check', RequestMethods.GET, '');

export const apiUserProfile = () => apiBase<{
    username: string,
    profile : {
        avatar: string,
        sign: string,
        memory: number,
        max_memory: number,
        intro: boolean
    },
    organizations: Organization[],
    followings: Organization[],
    manages: Organization[],
}>('/v1/user/profile', RequestMethods.GET, '');

export const apiUserUpdate = (username: string, avatar: string, sign: string) => apiBase<{
    success: boolean,
}>(`/v1/user/update`, RequestMethods.POST, {
    username, avatar, sign
})

export const apiAdminSearchUser = (username: string) => apiBase<{
    users: {
        ID: number,
        username: string,
        email: string,
        CreatedAt: string,
        UpdatedAt: string,
        role: number,
    }[]
}>(`/v1/user/admin/search`, RequestMethods.GET, {
    username
})

export const apiAdminUserList = (page: number) => apiBase<{
    users: {
        ID: number,
        username: string,
        email: string,
        CreatedAt: string,
        UpdatedAt: string,
        role: number,
    }[],
    total: number,
}>(`/v1/user/admin/list`, RequestMethods.GET, {
    page
})

export const apiUserIntro = () => apiBase<{
    success: boolean,
}>(`/v1/user/intro`, RequestMethods.POST, {})