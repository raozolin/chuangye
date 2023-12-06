import { RequestMethods, apiBase } from "./base";

export const apiLoginVercode = () => apiBase<{
    token: string,
    image: string
}>('/v1/vercode/login', RequestMethods.GET, '')

export const apiRegisterVercodePre = () => apiBase<{
    token: string,
    image: string
}>('/v1/vercode/reg/pre', RequestMethods.GET, '')

export const apiRegisterVercode = (pre_vercode_token: string, pre_vercode_result: string, email: string) => apiBase<{
    token: string,
}>('/v1/vercode/reg', RequestMethods.POST, {
    pre_vercode_token, pre_vercode_result, email
})

export const apiPhoneLoginVercodePre = () => apiBase<{
    token: string,
    image: string,
    prompt: string
}>('/v1/vercode/login/phone/pre', RequestMethods.GET, '')

export const apiPhoneLoginVercode = (pre_vercode_token: string, pre_vercode_result: string, phone: string) => apiBase<{
    token: string,
}>('/v1/vercode/login/phone', RequestMethods.POST, {
    pre_vercode_token, pre_vercode_result, phone
})