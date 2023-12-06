<template>
    <NH2 prefix="bar">
        <NText type="primary">
            {{ UserName }} 的个人资料
        </NText>
    </NH2>
    <NDivider></NDivider>
    <NH4 prefix="">
        <NText type="primary">{{ $t('user.Profile.157805-0') }}</NText>
        <NForm class="mt5">
            <NFormItem :label="$t('user.Profile.157805-1')">
                <NSpace justify="center" class="w100">
                    <NTooltip trigger="hover">
                        <template #trigger>
                            <NAvatar @click="uploadAvatar" class="clickable" :size="120" :src="userProfileForm.avatar"
                                round></NAvatar>
                        </template>
                        {{ $t('user.Profile.157805-2') }}
                    </NTooltip>
                </NSpace>
            </NFormItem>
            <NFormItem :label="$t('user.Profile.157805-3')">
                <NInput v-model:value="userProfileForm.username"></NInput>
            </NFormItem>
            <NFormItem :label="$t('user.Profile.157805-4')">
                <NInput v-model:value="userProfileForm.sign"></NInput>
            </NFormItem>
            <NFormItem label="修改">
                <NButton type="primary" class="w100" @click="saveProfile">提交</NButton>
            </NFormItem>
        </NForm>
    </NH4>
</template>

<script setup lang="ts">
import { NAvatar, NBlockquote, NButton, NDivider, NForm, NFormItem, NH2, NH4, NInput, NLi, NSpace, NText, NTooltip, NUl, useDialog, useLoadingBar, useMessage } from 'naive-ui'
import { useUserStore } from '../../store/user'
import { storeToRefs } from 'pinia'
import { h, onMounted, ref, watch } from 'vue'
import { apiUserProfile } from '../../interface/user'
import { useI18n } from 'vue-i18n'
import { apiUserUpdate } from '../../interface/user'
import { apiUploadFile } from '../../interface/file'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const { t: $t } = useI18n()

const message = useMessage()
const userStore = useUserStore()
const dialog = useDialog()

const { UserName, UserSign, UserId, UserAvatar } = storeToRefs(userStore)

const userProfileForm = ref({
    username: UserName.value,
    sign: UserSign.value,
    avatar: UserAvatar.value,
})

watch(UserId, () => {
    loadProfile()
})

const loadProfile = async () => {
    const response = await apiUserProfile()
    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        userProfileForm.value.username = response.data?.username || ''
        userProfileForm.value.sign = response.data?.profile.sign || ''
        userProfileForm.value.avatar = response.data?.profile.avatar || ''
    }
}

const uploadAvatar = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) {
            return
        }

        const cropperRef = ref()
        let canvas: HTMLCanvasElement | null = null

        dialog.info({
            title: '裁切头像',
            content: () => h('div', {
                style: {
                    width: '100%',
                    height: '300px',
                }
            }, h(Cropper, {
                ref: cropperRef,
                src: URL.createObjectURL(file),
                onChange: (e: any) => {
                    canvas = e.canvas
                }
            })),
            onPositiveClick: async () => {
                const blob = await fetch(canvas?.toDataURL() || '').then(res => res.blob())
                const newFile = new File([blob], file.name, { type: 'image/jpeg' })
                const response = await apiUploadFile(newFile)
                if (!response.isSuccess()) {
                    message.error(response.getError())
                } else {
                    userProfileForm.value.avatar = response.data?.url || ''
                }
            },
            positiveText: '确认',
        })
    }
    input.click()
}

onMounted(async () => {
    const loadingBar = useLoadingBar()
    loadingBar.start()
    await loadProfile()
    loadingBar.finish()
})

const saveProfile = async () => {
    const response = await apiUserUpdate(
        userProfileForm.value.username, userProfileForm.value.avatar, userProfileForm.value.sign
    )
    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        message.success('修改成功')
        userStore.refresh()
        loadProfile()
    }
}

</script>