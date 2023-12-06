<template>
    <div class="b-v-organization-edit-profile my5 mx5">
        <NH2 prefix="bar">
            <NText type="primary">
                修改 {{ organizationForm.name }} 资料
            </NText>
        </NH2>
        <NDivider></NDivider>
        <NForm>
            <NFormItem label="头像">
                <NSpace justify="center" class="w100">
                    <NTooltip trigger="hover">
                        <template #trigger>
                            <NAvatar @click="uploadAvatar" class="clickable" :size="120" :src="organizationForm.avatar"
                                round></NAvatar>
                        </template>
                        {{ $t('user.Profile.157805-2') }}
                    </NTooltip>
                </NSpace>
            </NFormItem>
            <NFormItem label="名称">
                <NInput v-model:value="organizationForm.name"></NInput>
            </NFormItem>
            <NFormItem label="类型">
                <NSelect :options="typeOptions" v-model:value="organizationForm.type"></NSelect>
            </NFormItem>
            <NFormItem label="描述">
                <NInput type="textarea" v-model:value="organizationForm.description"></NInput>
            </NFormItem>
            <NFormItem>
                <NButton class="w100" type="primary" @click="submit">提交</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>

<script setup lang="ts">
import { NAvatar, NButton, NDivider, NForm, NFormItem, NH2, NInput, NSelect, NSpace, NText, NTooltip, useDialog, useMessage } from 'naive-ui'
import { apiOrganizationInfo, apiOrganizationUpdate } from '../../interface/organization'
import { h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiUploadFile } from '../../interface/file'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useUserStore } from '../../store/user'
import { getOrganizationTypeSheet } from '../../utils/organization_types'

const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const userStore = useUserStore()

const oid = ref(0)
onMounted(() => {
    const id = parseInt(route.params.oid as string)
    if (id) {
        oid.value = id
        loadOrganizationInfo()
    }
})

const typeOptions = ref(getOrganizationTypeSheet().map(v => ({
    label: v.name,
    value: v.code,
})))

const organizationForm = ref({
    avatar: '',
    name: '',
    description: '',
    type: '',
})

const uploadAvatar = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) {
            return
        }

        let canvas: HTMLCanvasElement | null = null

        dialog.info({
            title: '裁切头像',
            content: () => h('div', {
                style: {
                    width: '100%',
                    height: '300px',
                }
            }, h(Cropper, {
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
                    organizationForm.value.avatar = response.data?.url || ''
                }
            },
            positiveText: '确认',
        })
    }
    input.click()
}

const loadOrganizationInfo = async () => {
    const response = await apiOrganizationInfo(oid.value)
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    organizationForm.value.name = response.data?.organization.name || ''
    organizationForm.value.description = response.data?.organization.description || ''
    organizationForm.value.avatar = response.data?.organization.avatar || ''
    organizationForm.value.type = response.data?.organization.type || ''
}

const submit = async () => {
    const response = await apiOrganizationUpdate(
        oid.value, organizationForm.value.name, 
        organizationForm.value.description, organizationForm.value.avatar,
        organizationForm.value.type
    )
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    message.success('修改成功')
    userStore.refresh()
}

</script>

<style scoped>
.b-v-organization-edit-profile {
    background-color: white;
    border-radius: 12px;
    padding: 12px;
}
</style>