<template>
    <div class="b-v-notification-detail">
        <NCard>
            <NPageHeader @back="back">
                <template #title>
                    <div @click="toOrganization">
                        {{ organization?.name }}
                    </div>
                </template>
                <template #header>
                    <NBreadcrumb>
                        <NBreadcrumbItem>
                            <NEllipsis style="max-width: 20vw;">
                                {{ organization?.name }}
                            </NEllipsis>
                        </NBreadcrumbItem>
                        <NBreadcrumbItem>
                            <NEllipsis style="max-width: 20vw;">
                                {{ notification?.title }}
                            </NEllipsis>
                        </NBreadcrumbItem>
                    </NBreadcrumb>
                </template>
                <template #avatar>
                    <NAvatar :src="organization?.avatar" round></NAvatar>
                </template>
                <NTag :bordered="false" type="info" round>
                    【{{ member?.role }}】{{ member?.name }}发布于
                    {{ new Date(notification?.created_at || 0).toLocaleDateString() }}
                </NTag>
            </NPageHeader>
        </NCard>
        <NCard :bordered="false">
            <NThing>
                <template #header>
                    {{ notification?.title }}
                </template>
                <template #description>
                    <div class="mt5">
                        <NBlockquote>
                            {{ notification?.body }}
                        </NBlockquote>
                    </div>
                    <NSpace justify="space-between">
                        <NTag round type="primary" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Time"></NIcon>
                            </template>
                            发布于<NTime :time="new Date(notification?.end_at || 0)" :to="new Date()" type="relative"></NTime>
                        </NTag>
                        <NTag round type="info" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="List"></NIcon>
                            </template>
                            事项数量：{{ tasks?.length }}
                        </NTag>
                    </NSpace>
                    <NDivider v-if="tasks?.length" title-placement="left">事项列表</NDivider>
                    <NCollapse v-if="tasks?.length" :expanded-names="tasks?.map(task => task.task.title)" class="mt2">
                        <NCollapseItem :title="task.task.title" v-for="task in tasks" :name="task.task.title">
                            <template #header-extra>
                                <NTime :time="new Date(task.end_at || 0)" :to="new Date()" type="relative"></NTime>结束
                            </template>
                            <NBlockquote>
                                {{ task.task.body }}
                            </NBlockquote>
                            <NButton type="info" size="small" class="w100" v-if="task.is_done != 1"
                                @click="completeTask(task)">
                                <template #icon v-if="task?.is_done == 1">
                                    <NIcon :component="Checkmark"></NIcon>
                                </template>
                                {{ task?.is_done == 1 ? '已完成' : '完成事项' }}
                            </NButton>
                        </NCollapseItem>
                    </NCollapse>
                    <NDivider></NDivider>
                    <NSpace justify="space-between">
                        <NTag round type="info" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Cellular"></NIcon>
                            </template>
                            优先级：{{ notification?.priority }}
                        </NTag>
                        <NTag round v-if="user_notification?.is_confirmed" type="primary" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Checkmark"></NIcon>
                            </template>
                            已确认
                        </NTag>
                        <NTag round v-else type="error" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Close"></NIcon>
                            </template>
                            未确认
                        </NTag>
                        <NTag round v-if="user_notification?.is_read" type="primary" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Checkmark"></NIcon>
                            </template>
                            已读
                        </NTag>
                        <NTag round v-else type="error" class="mr1 mt2" :bordered="false">
                            <template #icon>
                                <NIcon :component="Close"></NIcon>
                            </template>
                            未读
                        </NTag>
                    </NSpace>
                </template>

                <template #header-extra>
                    <NTime :time="new Date(notification?.created_at || 0)" :to="new Date()" type="relative"></NTime>
                </template>
                <template #action v-if="!user_notification?.is_read">
                    <NButton type="primary" size="small" class="w100" :disabled="user_notification?.is_read == 1"
                        @click="readNotification(user_notification)">
                        <template #icon v-if="user_notification?.is_read">
                            <NIcon :component="Checkmark"></NIcon>
                        </template>
                        {{ user_notification?.is_read == 1 ? '已读' : '标记为已读' }}
                    </NButton>
                </template>
            </NThing>
        </NCard>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { notificationDatabase, useNotificationDetail } from '../../store/notification'
import { useRoute, useRouter } from 'vue-router'
import {
    NAvatar, NBlockquote, NBreadcrumb, NBreadcrumbItem, NButton, NButtonGroup, NCard, NCollapse, NCollapseItem, NDivider,
    NEllipsis, NGi, NGrid, NIcon, NList, NListItem, NPageHeader, NSpace, NTag, NThing, NTime, useMessage
} from 'naive-ui'
import { getAssetsFile } from '../../utils'
import { Cellular, CheckboxOutline, Checkmark, Close, EnterOutline, EyeOutline, HeartOutline, List, Time, Timer } from '@vicons/ionicons5'
import {
    apiNotficationProfile,
    apiNotificationView,
    apiNotificationRead,
    apiNotificationTaskComplete
} from '../../interface/notification'
import { UserNotification, NotificationProfile, UserTask, OrganizationMember } from '../../interface/typ'

const message = useMessage()
const route = useRoute()
const router = useRouter()

const back = () => {
    router.back()
}

const nid = ref(parseInt(route.params.nid as string))
const { user_notification, notification, organization, tasks } = useNotificationDetail(nid.value)

const readNotification = async (notification: UserNotification) => {
    if (notification.is_read) {
        return
    }
    notification.is_read = 1

    await notificationDatabase.user_notifications.update(notification.id, {
        is_read: 1,
    })

    const response = await apiNotificationRead(notification.id)
    if (!response.isSuccess()) {
        message.error(response.getError())
        notification.is_read = 0
        await notificationDatabase.user_notifications.update(notification.id, {
            is_read: 0,
        })
    }
}

const completeTask = async (task: UserTask) => {
    if (task.is_done) {
        return
    }
    task.is_done = 1

    await notificationDatabase.user_tasks.update(task.id, {
        is_done: 1,
    })

    const response = await apiNotificationTaskComplete(task.id)
    if (!response.isSuccess()) {
        message.error(response.getError())
        task.is_done = 0
        await notificationDatabase.user_tasks.update(task.id, {
            is_done: 0,
        })
    }
}

const viewNotification = (nid: number) => {
    apiNotificationView(nid)
}

const profile = ref<NotificationProfile>({
    views: 0,
    clicks: 0,
    likes: 0,
    reads: 0,
    notification_id: 0,
    sends: 0,
})
const member = ref<OrganizationMember>()
watch(nid, async (value) => {
    if (value) {
        const response = await apiNotficationProfile(value)
        if (!response.isSuccess()) {
            message.error(response.getError())
        } else {
            profile.value.views = response.data?.profile.views || 0
            profile.value.clicks = response.data?.profile.clicks || 0
            profile.value.likes = response.data?.profile.likes || 0
            profile.value.reads = response.data?.profile.reads || 0
            member.value = response.data?.member
        }

        viewNotification(value)
    }
}, { immediate: true })

const toOrganization = () => {
    router.push('/organization/detail/' + notification.value?.organization_id)
}

</script>

<style scoped>
.b-v-notification-detail {
    min-height: 100%;
    background-color: white;
}
</style>