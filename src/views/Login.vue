<template>
    <div class="login mx-auto">
        <NCard v-if="!isClient">
            <NTabs
                size="large"
                animated
                pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
                pane-wrapper-style="margin: 0 -4px"
                @update:value="handleTabUpdate"
                ref="tabsInstRef"
            >
                <NTabPane name="手机直接登录">
                    <NForm :model="phoneLoginForm" :rules="rules" ref="formRefLogin">
                        <NFormItemRow label="手机号" path="phone">
                            <NInput v-model:value="phoneLoginForm.phone" placeholder="请输入手机号" />
                        </NFormItemRow>
                        <NFormItemRow label="确保您是人类，而非机器人，请完成下方验证">
                            <ClickCaptcha 
                                :prompt="phoneLoginVercode.pre_prompt" 
                                :src="phoneLoginVercode.pre_image" 
                                @update="handlePhoneLoginImageVercodeUpdate($event)"
                                width="100%"
                            ></ClickCaptcha>
                        </NFormItemRow>
                        <NButton block type="primary" @click="getPhoneLoginVercodePre">
                            <template #icon>
                                <NIcon :component="Refresh"></NIcon>
                            </template>
                            刷新验证码
                        </NButton>
                        <NDivider></NDivider>
                        <NFormItemRow label="短信验证码">
                            <NInput placeholder="请输入您即将收到的短信验证码" v-model:value="phoneLoginForm.vercode" />
                        </NFormItemRow>
                        <NFormItemRow>
                            <NButton block type="primary" @click="phoneLogin">
                                <template #icon>
                                    <NIcon :component="LogIn"></NIcon>
                                </template>
                                {{ $t('views.LogIn.169953-0') }}
                            </NButton>
                        </NFormItemRow>
                    </NForm>
                </NTabPane>
                <NTabPane name="密码登录">
                    <NForm :model="loginForm" :rules="rules" ref="formRefLogin">
                        <NFormItemRow :label="$t('views.LogIn.169953-1')" path="identifier">
                            <NInput v-model:value="loginForm.identifier" :placeholder="$t('views.LogIn.169953-2')" />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.169953-3')" path="password">
                            <NInput 
                                show-password-on="mousedown" 
                                type="password" 
                                v-model:value="loginForm.password" 
                                :placeholder="$t('views.LogIn.169953-4')" 
                            />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.621117-0')">
                            <img :src="loginVercode.image" class="clickable" @click="getLoginVercode" style="height: 40px;" />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.621117-1')">
                            <NInput v-model:value="loginVercode.result" />
                        </NFormItemRow>
                        <NFormItemRow>
                            <NButton block type="primary" @click="login">{{ $t('views.LogIn.169953-0') }}</NButton>
                        </NFormItemRow>
                    </NForm>
                </NTabPane>
                <NTabPane name="邮箱注册">
                    <NForm :model="regiterForm" :rules="rules" ref="formRefRegister">
                        <NFormItemRow :label="$t('views.LogIn.169953-6')" path="username">
                            <NInput v-model:value="regiterForm.username" :placeholder="$t('views.LogIn.169953-7')" />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.169953-1')" path="email">
                            <NInput v-model:value="regiterForm.email" :placeholder="$t('views.LogIn.169953-2')" />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.169953-3')" path="password">
                            <NInput 
                                v-model:value="regiterForm.password" 
                                :placeholder="$t('views.LogIn.169953-4')" 
                                show-password-on="mousedown"
                                type="password"
                            />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.621117-2')">
                            <img :src="registerVercode.pre_image" class="clickable" @click="getRegisterVercodePre" style="height: 40px;" />
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.621117-3')">
                            <NInputGroup>
                                <NInput v-model:value="registerVercode.pre_result"></NInput>
                                <NButton type="primary" @click="getRegisterVercode">{{ $t('views.LogIn.621117-4') }}</NButton>
                            </NInputGroup>
                        </NFormItemRow>
                        <NFormItemRow :label="$t('views.LogIn.621117-5')">
                            <NInput v-model:value="registerVercode.result" />
                        </NFormItemRow>
                        <NFormItemRow>
                            <NButton block type="primary" @click="register">{{ $t('views.LogIn.169953-5') }}</NButton>
                        </NFormItemRow>
                    </NForm>
                </NTabPane>
            </NTabs>
        </NCard>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FormInst, NButton, NCard, NDivider, NForm, NFormItemRow, NIcon, NInput, NInputGroup, NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { apiLogin, apiPhoneLogin } from '../interface/login'
import { apiRegister } from '../interface/register'
import { 
    apiLoginVercode, apiRegisterVercode, apiRegisterVercodePre, apiPhoneLoginVercodePre, apiPhoneLoginVercode
} from '../interface/vercode'
import { loginTokenSet } from '../store/login'
import { refreshLoginStatus } from '../middleware/auth/login'
import { hashPassword } from '../utils/crypto'
import { apiNotificationSyncEmpty } from '../interface/notification'
import { cleanRedundancyNotification } from '../store/notification'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'
import { LogIn, MailOpen, Refresh } from '@vicons/ionicons5'
import ClickCaptcha from '../component/ClickCaptcha.vue'

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const message = useMessage()

const isClient = ref(navigator.userAgent.toLocaleLowerCase().includes('electron'))

const loginForm = ref({
    identifier: '',
    password: '',
})

const phoneLoginForm = ref({
    phone: '',
    vercode: '',
})

const phoneLoginVercode = ref({
    pre_token: '',
    pre_result: '',
    pre_image: '',
    pre_prompt: '',
    result: '',
    token: '',
})

const regiterForm = ref({
    email: '',
    username: '',
    password: '',
    vercode: '',
    vercodeToken: '',
})

const loginVercode = ref({
    result: '',
    token: '',
    image: ''
})

const registerVercode = ref({
    pre_token: '',
    pre_result: '',
    pre_image: '',
    result: '',
    token: '',
    invite_code: ''
})

const rules = ref({
    identifier: {
        validator: (rule: any, value: string) => {
            if (!value) {
                return Error('请输入邮箱或手机号')
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) && !/^[0-9]{11}$/.test(value)) {
                return Error('请输入正确的邮箱或手机号')
            }
            return true
        },
        trigger: 'input'
    },
    username: {
        validator: (rule: any, value: string) => {
            if (!value) {
                return Error($t('views.LogIn.169953-7'))
            }
            if (value.length < 2) {
                return Error('用户名长度不能小于2位')
            }
            return true
        },
        trigger: 'input'
    },
    phone: {
        validator: (rule: any, value: string) => {
            if (!value) {
                return Error('请输入手机号')
            }
            if (!/^[0-9]{11}$/.test(value)) {
                return Error('请输入正确的手机号')
            }
            return true
        },
        trigger: 'input'
    },
    email: {
        validator: (rule: any, value: string) => {
            if (!value) {
                return Error($t('views.LogIn.169953-2'))
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                return Error($t('views.LogIn.169953-10'))
            }
            return true
        },
        trigger: 'input'
    },
    password: {
        validator: (rule: any, value: string) => {
            if (!value) {
                return Error($t('views.LogIn.169953-4'))
            }
            if (value.length < 6) {
                return Error($t('views.LogIn.169953-11'))
            }
            return true
        },
        trigger: 'input'
    }
})

const handleTabUpdate = (name: string) => {
    if (name === '密码登录') {
        if (loginVercode.value.token === '') {
            getLoginVercode()
        }
    } else if (name === '邮箱注册') {
        if (registerVercode.value.pre_token === '') {
            getRegisterVercodePre()
        }
    } else if (name === '手机验证码') {
        if (phoneLoginVercode.value.pre_token === '') {
            getPhoneLoginVercodePre()
        }
    }
}

const getFormValidate = (formRef: FormInst) => new Promise((resolve) => {
    try {
        formRef.validate((errros) => {
            if(!errros) {
                resolve(true)
            } else {
                resolve(false)
            }
        }).catch(() => {
            resolve(false)
        })
    } catch (err) {
        resolve(false)
    }
})

const getLoginVercode = async () => {
    const response = await apiLoginVercode()
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loginVercode.value.token = response.data?.token as string
    loginVercode.value.image = response.data?.image as string
}

const getRegisterVercodePre = async () => {
    const response = await apiRegisterVercodePre()
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    registerVercode.value.pre_token = response.data?.token as string
    registerVercode.value.pre_image = response.data?.image as string
}

const getPhoneLoginVercodePre = async () => {
    const response = await apiPhoneLoginVercodePre()
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    phoneLoginVercode.value.pre_token = response.data?.token as string
    phoneLoginVercode.value.pre_image = response.data?.image as string
    phoneLoginVercode.value.pre_prompt = response.data?.prompt as string
}

const handlePhoneLoginImageVercodeUpdate = (value: string) => {
    phoneLoginVercode.value.pre_result = value
    if (!phoneLoginForm.value.phone  && phoneLoginVercode.value.pre_result.split(',').length === 6) {
        message.error('请输入手机号')
        getPhoneLoginVercodePre()
        return
    }
    if (phoneLoginForm.value.phone && phoneLoginVercode.value.pre_result && phoneLoginVercode.value.pre_result.split(',').length === 6) {
        getPhoneLoginVercode()
    }
}

const getPhoneLoginVercode = async () => {
    if (!phoneLoginForm.value.phone) {
        message.error('请输入手机号')
        return
    }

    if (!phoneLoginVercode.value.pre_result) {
        message.error('请完成验证')
        return
    }

    const response = await apiPhoneLoginVercode(
        phoneLoginVercode.value.pre_token,
        phoneLoginVercode.value.pre_result,
        phoneLoginForm.value.phone
    )
    if (!response.isSuccess()) {
        message.error(response.getError())
        getPhoneLoginVercodePre()
        return
    }
    phoneLoginVercode.value.token = response.data?.token as string
    message.success('验证码已发送')
}

const getRegisterVercode = async () => {
    const response = await apiRegisterVercode(
        registerVercode.value.pre_token,
        registerVercode.value.pre_result,
        regiterForm.value.email
    )
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    registerVercode.value.token = response.data?.token as string
    message.success($t('views.LogIn.621117-7'))
}

const userStore = useUserStore()
const { UserId, Welcome } = storeToRefs(userStore)

const formRefLogin = ref<FormInst | null>(null)
const login = async () => {
    const isValid = await getFormValidate(formRefLogin.value as FormInst)
    if (!isValid) {
        message.error($t('views.LogIn.169953-12'))
    }

    const response = await apiLogin(
        loginForm.value.identifier,
        hashPassword(loginForm.value.password),
        loginVercode.value.token,
        loginVercode.value.result
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (response.data?.success) {
        message.success($t('views.LogIn.914867-0'))
        loginTokenSet(response.data?.uid as number, response.data?.login_token as string)
        refreshLoginStatus()

        // refresh notification
        const empty_response = await apiNotificationSyncEmpty()
        if (!empty_response.isSuccess()) {
            message.error('刷新失败：' + empty_response.getError())
        }

        // clean redundancy notification
        await cleanRedundancyNotification(UserId.value)

        setTimeout(() => {
            router.push('/notification')
        }, 500)
    } else {
        message.error($t('views.LogIn.621117-8'))
        loginVercode.value.token = response.data?.new_token as string
    }
}

const phoneLogin = async () => {
    const isValid = await getFormValidate(formRefLogin.value as FormInst)
    if (!isValid) {
        message.error('请检查手机号和验证码')
    }

    const response = await apiPhoneLogin(
        phoneLoginVercode.value.token,
        phoneLoginForm.value.vercode,
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (response.data?.success) {
        message.success('登录成功')
        loginTokenSet(response.data?.uid as number, response.data?.token as string)
        refreshLoginStatus()

        // refresh notification
        const empty_response = await apiNotificationSyncEmpty()
        if (!empty_response.isSuccess()) {
            message.error('刷新失败：' + empty_response.getError())
        }

        // clean redundancy notification
        await cleanRedundancyNotification(UserId.value)

        setTimeout(() => {
            router.push('/notification')
        }, 500)
    } 
}

const formRefRegister = ref<FormInst | null>(null)
const register = async () => {
    const isValid = await getFormValidate(formRefRegister.value as FormInst)
    if (!isValid) {
        message.error($t('views.LogIn.169953-12'))
    }

    const response = await apiRegister(
        regiterForm.value.username,
        hashPassword(regiterForm.value.password),
        registerVercode.value.token,
        registerVercode.value.result,
        registerVercode.value.invite_code
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (response.data?.success) {
        message.success($t('views.LogIn.621117-9'))

        setTimeout(() => {
            window.location.href = '/login'
        }, 500)
    } else {
        message.error($t('views.LogIn.621117-10'))
        registerVercode.value.token = response.data?.new_token as string
    }
}

onMounted(() => {
    if(!Welcome.value) {
        router.push('/welcome')
    }
    getPhoneLoginVercodePre()
})

</script>

<style scoped>
.login {
    min-height: 100%;
    background-color: white;
}
</style>