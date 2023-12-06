import axios from 'axios'
import { loginTokenGet } from '../store/login'
import { Response } from './base'

export const apiUploadFile = (file: File) => new Promise<Response<{
    url: string
}>>(async (resolve) => {
    const { uid, token } = loginTokenGet()
    const formData = new FormData()
    formData.append('file', file)
    try {
        const data = await axios.post<Response>('/v1/oss/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Billboards-User-Id': uid,
                'Billboards-User-Token': token
            }
        })
        const response = new Response<{
            url: string
        }>()
        if(typeof data === 'string') {
            response.success = false
            resolve(response)
        } else {
            response.success = true
            Object.assign(response, data.data)
            resolve(response)
        }
    } catch (e: any) {
        const response = new Response<{
            url: string
        }>()
        try {
            Object.assign(response, e.response.data)
        } catch (e) {
            response.message = '未知错误'
        }
        response.success = false
        resolve(response)
    }
})