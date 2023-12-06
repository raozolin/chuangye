<template>
    <div class="b-v-settings mx3 my5">
        <NDivider style="margin: 2px;" title-placement="left">账户</NDivider>
        <NList size="small">
            <NListItem>
                <NButton @click="logout" class="w100 text-left" type="error">
                    <template #icon>
                        <NIcon :component="LogOut"></NIcon>
                    </template>
                    登出
                </NButton>
            </NListItem>
        </NList>
        <NDivider style="margin: 2px;" title-placement="left">通知</NDivider>
        <NList size="small">
            <NListItem>
                <NButton @click="sync" class="w100 text-left" type="info">
                    <template #icon>
                        <NIcon :component="FlowerOutline"></NIcon>
                    </template>
                    强制同步全部数据
                </NButton>
            </NListItem>
        </NList>
    </div>
</template>

<script setup lang="ts">
import { FlowerOutline, LogOut } from '@vicons/ionicons5';
import { NButton, NDivider, NIcon, NList, NListItem, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { apiNotificationSyncEmpty } from '../interface/notification'

const router = useRouter()
const message = useMessage()

const logout = () => {
    router.push('/logout')
}

const sync = async () => {
    const response = await apiNotificationSyncEmpty()
    if(!response.isSuccess()) {
        message.error(response.getError())
    } else {
        message.success('同步成功，下次刷新通知将会强制同步全部数据')
    }
}

</script>

<style scoped>
.b-v-settings {
    padding: 12px;
    background-color: white;
    border-radius: 12px;
}
</style>