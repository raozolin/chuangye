import { useUserStore } from '../../store/user'
import { apiUserCheck } from '../../interface/user'
import { messageController } from '../message/message'

import { $t } from '../../locale/index'

let isChecked = false
const afterChecks : (() => void)[] = []

// hooks for login status, sometimes we need to check login status before
// such as detect which page should be displayed
export const onCheckedLogin = (callback : () => void) => {
    if(isChecked) {
        callback()
        return
    }
    afterChecks.push(callback)
}

export const refreshLoginStatus = async () => {
    const userStore = useUserStore()
    const response = await apiUserCheck<{
        username: string,
        role: string,
        uid: number,
        intro: boolean
    }>()
    isChecked = true
    if(response.isSuccess()) {
        userStore.setUserName(response.data?.username || $t('auth.login.596980-0'))
        userStore.setUserRole(response.data?.role || $t('auth.login.596980-1'))
        userStore.setUserId(response.data?.uid || 0)
        userStore.setUserIntro(response.data?.intro || false)
        if (response.data?.uid != 0) {
            userStore.setUserOnline(true)
        }
        messageController.refresh()
    } else {
        userStore.setUserName($t('auth.login.596980-0'))
        userStore.setUserRole($t('auth.login.596980-1'))
        userStore.setUserId(0)
        userStore.setUserOnline(false)
        userStore.setUserIntro(false)
        messageController.close()
    }

    setTimeout(() => {
        afterChecks.forEach((callback) => {
            callback()
        })
    })
}

export const logout = () => {
    messageController.close()
}