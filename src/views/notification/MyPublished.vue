<template>
    <div class="b-v-notification-published-user">
        <div class="px5">
            <div v-if="notifications.length == 0">
                <NEmpty description="您还没有发布任何通知" class="pt5"></NEmpty>
            </div>
            <div v-else>
                <NStatistic label="我发布的" tabular-nums class="mb5">
                    <NNumberAnimation :from="0" :to="total"></NNumberAnimation>
                    <template #prefix>
                        <NIcon color="green" :component="NotificationsOutline"></NIcon>
                    </template>
                    <template #suffix>条</template>
                </NStatistic>
                <NThing class="mb5" v-for="notification in notifications" content-indented>
                    <template #avatar>
                        <NAvatar :src="notification.organization?.avatar"></NAvatar>
                    </template>
                    <template #header>
                        {{ notification.title }}
                    </template>
                    <template #header-extra>
                        <NButton type="primary" size="small" @click="toStatistics(notification)">
                            <template #icon>
                                <NIcon :component="PieChartOutline"></NIcon>
                            </template>
                            统计数据
                        </NButton>
                    </template>
                    <div style="margin-top: -8px;">
                        发布于 <NTime :time="new Date(notification.created_at || 0)" :to="new Date()" type="relative"></NTime>
                    </div>
                </NThing>
                <NButton class="mb3" v-if="!over" block type="primary" @click="nextPage">
                    <template #icon>
                        <NIcon :component="Refresh"></NIcon>
                    </template>
                    加载更多
                </NButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiNotificationListPublishedByUser } from '../../interface/notification'
import { Notification } from '../../interface/typ'
import { NAvatar, NButton, NCard, NEmpty, NIcon, NNumberAnimation, NResult, NStatistic, NThing, NTime, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { NotificationsOutline, PieChartOutline, Refresh } from '@vicons/ionicons5'

const message = useMessage()
const router = useRouter()
const route = useRoute()

const page = ref(1)
const total = ref(0)
const over = computed(() => {
    return notifications.value.length >= total.value
})

const notifications = ref<Notification[]>([])

const loadNotifications = async () => {
    const response = await apiNotificationListPublishedByUser(page.value)
    if (response.isSuccess()) {
        notifications.value.push(...response.data?.notifications || [])
        total.value = response.data?.total || 0
    } else {
        message.error(response.getError())
    }
}

const nextPage = () => {
    page.value += 1
    loadNotifications()
}

const toStatistics = (notification: Notification) => {
    router.push(`/notification/statistics/${notification.id}`)
}

onMounted(() => {
    loadNotifications()
})

</script>

<style scoped>
.b-v-notification-published-user {
    min-height: 100%;
    background-color: white;
}
</style>