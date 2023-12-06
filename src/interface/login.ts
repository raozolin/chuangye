import { RequestMethods, apiBase } from "./base"

export const apiGithubLogin = <T>(code: string) => apiBase<T>('/v1/user/login/github', RequestMethods.POST, {
    code
})

export const apiLogin = (identifier: string, password: string, vercode_token: string, vercode: string) => apiBase<{
    success: boolean,
    new_token: string,
    login_token: string,
    uid: number,
}>('/v1/user/login', RequestMethods.POST, {
    identifier: identifier, password, vercode_token, vercode
})

export const apiAcceptKasumiLogin = (token: string) => apiBase<{
    success: boolean,
}>(`/v1/user/login/kasumi/accept`, RequestMethods.POST, {
    token
})

export const apiCheckKasumiLogin = (token: string) => apiBase<{
    success: boolean,
    token: string,
    uid: number,
}>(`/v1/user/login/kasumi/check`, RequestMethods.POST, {
    token
})

export const apiPhoneLogin = (vercode_token: string, vercode: string) => apiBase<{
    success: boolean,
    token: string,
    uid: number,
}>('/v1/user/login/phone', RequestMethods.POST, {
    vercode_token, vercode
})