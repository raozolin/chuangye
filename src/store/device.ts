/**
 * This file take care of the device state, generate an unique id for current
 */

import md5 from 'md5'

const BILLBOARDS_DEVICE_ID_KEY = 'billboards.device.id'

export const getDeviceId = (): {
    deviceId: string,
    ua: string,
} => {
    const id = localStorage.getItem(BILLBOARDS_DEVICE_ID_KEY)
    if (id) {
        return {
            deviceId: id,
            ua: navigator.userAgent,
        }
    }
    // random generate a device id
    const deviceId = md5(new Date().getTime().toString())
    localStorage.setItem(BILLBOARDS_DEVICE_ID_KEY, deviceId)

    return {
        deviceId,
        ua: navigator.userAgent,
    }
}