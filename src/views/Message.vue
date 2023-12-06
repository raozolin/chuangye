<template>
    <div class="b-v-messages">
        <div class="px5 py5">
            <div class="container-default" v-if="messages.length == 0">
                <NResult status="404" description="暂无消息">
                </NResult>
            </div>
            <div class="mb5" v-else v-for="message in messages">
                <NThing v-if="message.type == 'notification'" content-indented @click="readNotification">
                    <template #avatar>
                        <NBadge :value="message.count">
                            <NIcon color="green" :size="24" :component="Notifications"></NIcon>
                        </NBadge>
                    </template>
                    <template #header>
                        新通知
                    </template>
                    <template #header-extra>
                        <NButton type="primary" size="small" text class="mr3" @click="readNotification">确定</NButton>
                    </template>
                    您有{{ message.count }}条新通知
                </NThing>
                <NThing v-else-if="message.type == 'organization_join_apply'" content-indented @click="readOrganizationJoinApply(message.extra || 0)">
                    <template #avatar>
                        <NBadge :value="message.count">
                            <NIcon color="green" :size="24" :component="People"></NIcon>
                        </NBadge>
                    </template>
                    <template #header>
                        {{ message.name }}新成员加入申请
                    </template>
                    <template #header-extra>
                        <NButton type="primary" size="small" text class="mr3" @click="readOrganizationJoinApply(message.extra || 0)">处理</NButton>
                    </template>
                    {{ message.name }}有{{ message.count }}个未处理的加入申请
                </NThing>
                <NThing v-else-if="message.type == 'organization_join_apply_accepted'" content-indented @click="readOrganizationJoinApplyAccepted(message.extra || 0)">
                    <template #avatar>
                        <NBadge :value="message.count">
                            <NIcon color="green" :size="24" :component="CheckmarkOutline"></NIcon>
                        </NBadge>
                    </template>
                    <template #header>
                        {{ message.name }}加入申请已通过
                    </template>
                    <template #header-extra>
                        <NButton type="primary" size="small" text class="mr3">确定</NButton>
                    </template>
                    {{ message.name }}的加入申请已通过
                </NThing>
                <NThing v-else-if="message.type == 'organization_join_apply_rejected'" content-indented @click="readOrganizationJoinApplyRejected(message.extra || 0)">
                    <template #avatar>
                        <NBadge :value="message.count">
                            <NIcon color="red" :size="24" :component="CloseOutline"></NIcon>
                        </NBadge>
                    </template>
                    <template #header>
                        <NText type="error">
                            {{ message.name }}加入申请已拒绝
                        </NText>
                    </template>
                    <template #header-extra>
                        <NButton type="primary" size="small" text class="mr3">确定</NButton>
                    </template>
                    {{ message.name }}的加入申请已拒绝
                </NThing>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMessageStore } from '../store/message'
import { NBadge, NButton, NIcon, NResult, NText, NThing } from 'naive-ui'
import { CheckmarkOutline, CloseOutline, Notifications, NotificationsOutline, People } from '@vicons/ionicons5'
import { messageController } from '../middleware/message/message'
import { useRouter } from 'vue-router'

const router = useRouter()

const { messages } = storeToRefs(useMessageStore())

const readNotification = () => {
    messageController.readNotification()
}

const readOrganizationJoinApply = (organizationId: number) => {
    messageController.readOrganizationJoinApply(organizationId)
    router.push(`/organization/join_request/${organizationId}`)
}

const readOrganizationJoinApplyAccepted = (organizationId: number) => {
    messageController.readOrganizationJoinApplyAccepted(organizationId)
}

const readOrganizationJoinApplyRejected = (organizationId: number) => {
    messageController.readOrganizationJoinApplyRejected(organizationId)
}

</script>

<style scoped>
.b-v-messages {
    min-height: 100%;
    background-color: white;
    width: 100%;
    overflow: auto;
}
</style>