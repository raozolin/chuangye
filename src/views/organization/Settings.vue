<template>
    <div class="b-v-organization-settings px5 py5">
        <NCard embedded :bordered="false" style="border-radius: 12px;">
            <NDivider style="margin: 2px; font-size: small;" title-placement="left">加入申请设置(点击选项前方图标查看帮助)</NDivider>
            <NList style="background: transparent;">
                <NListItem style="margin: 0;">
                    <template #prefix>
                        <NTooltip :style="{
                            maxWidth: '75vw'
                        }">
                            <template #trigger>
                                <NIcon style="margin-top: 4px;" :size="22" :component="CreateOutline"></NIcon>
                            </template>
                            自动接受申请
                        </NTooltip>
                    </template>
                    自动审批
                    <template #suffix>
                        <NSwitch v-model:value="form.auto_accept"></NSwitch>
                    </template>
                </NListItem>
                <NListItem style="margin: 0;">
                    <template #prefix>
                        <NTooltip :style="{
                            maxWidth: '75vw'
                        }">
                            <template #trigger>
                                <NIcon style="margin-top: 4px;" :size="22" :component="CreateOutline"></NIcon>
                            </template>
                            当子级组织接受申请时，自动将申请转发给上级组织同时自动审批
                        </NTooltip>
                    </template>
                    子级组织自动审批 
                    <template #suffix>
                        <NSwitch v-model:value="form.auto_accept_child"></NSwitch>
                    </template>
                </NListItem>
            </NList>
        </NCard>
    </div>
</template>

<script setup lang="ts">
import { CreateOutline } from '@vicons/ionicons5';
import { NCard, NDivider, NIcon, NList, NListItem, NSwitch, NTooltip, useMessage } from 'naive-ui'
import { onMounted, ref, watch } from 'vue'

import { apiOrganizationGetSettings, apiOrganizationSetSettings } from '../../interface/organization'
import { useRoute } from 'vue-router'

const route = useRoute()
const message = useMessage()

const form = ref({
    auto_accept: false,
    auto_accept_child: false
})
let updateTimer = 0
watch(form, () => {
    clearTimeout(updateTimer)
    updateTimer = setTimeout(() => {
        saveSettings()
    }, 1000) as any
}, {
    deep: true
})

const oid = ref(0)
onMounted(() => {
    const id = parseInt(route.params.oid as string)
    if (id) {
        oid.value = id
        loadSettings()
    } 
})

const loadSettings = async () => {
    const response = await apiOrganizationGetSettings(oid.value)
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    form.value.auto_accept = response.data?.settings.auto_accept || false
    form.value.auto_accept_child = response.data?.settings.auto_accept_child || false
}

const saveSettings = async () => {
    const response = await apiOrganizationSetSettings(oid.value, form.value.auto_accept, form.value.auto_accept_child)
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    message.success('保存成功')
}

</script>

<style scoped>
.b-v-organization-settings {

}
</style>