import { RequestMethods, apiBase } from "./base"

export const apiGetVersion = () => apiBase<{
    version: {
        id: number,
        version: string,
    }
}>("/v1/version", RequestMethods.GET, '')