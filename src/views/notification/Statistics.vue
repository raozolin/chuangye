<template>
    <div class="b-v-notification-statistics">
        <div class="header">
            <NThing content-indented class="mx5">
                <template #header>
                    <NText type="primary">
                        {{ statistics?.notification.title }} 的统计信息
                    </NText>
                </template>
                <template #header-extra>
                    <NTime :time="new Date(statistics?.notification.start_at || 0)" :to="new Date()" type="relative"></NTime>
                </template>
            </NThing>
        </div>
        <div class="content">
            <div class="mx5">
                <NGrid cols="2">
                    <NGi class="mt3">
                        <NStatistic label="浏览量" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="CellularOutline"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_view"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                    <NGi class="mt3">
                        <NStatistic label="点击量" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="CaretUpCircleOutline"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_click"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                    <NGi class="mt3">
                        <NStatistic label="已确认收到数量" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="Checkmark"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_confirm"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                    <NGi class="mt3">
                        <NStatistic label="已确认已读数量" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="CheckmarkDone"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_read"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                    <NGi class="mt3">
                        <NStatistic label="已推送" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="Push"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_send"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                    <NGi class="mt3">
                        <NStatistic label="被喜欢" tabular-nums>
                            <template #prefix>
                                <NIcon color="green" :component="HeartCircle"></NIcon>
                            </template>
                            <NNumberAnimation :from="0" :to="statistics?.num_like"></NNumberAnimation>
                        </NStatistic>
                    </NGi>
                </NGrid>
            </div>
        </div>
        <div class="content">
            <div class="mx5 py5">
                <NGrid cols="1">
                    <NGi>
                        <NThing>
                            <template #header>
                                <NStatistic label="阅读率">
                                    <template #prefix>
                                        <NIcon color="green" :component="BalloonOutline"></NIcon>
                                    </template>
                                    <template #suffix>
                                        / {{ statistics?.num_send }}
                                    </template>
                                    <NNumberAnimation :from="0" :to="statistics?.num_read"></NNumberAnimation>
                                </NStatistic>
                            </template>
                            <template #header-extra>
                                {{ ((statistics?.num_read || 0) / (statistics?.num_send || 0) * 100).toFixed(2) }}%
                            </template>
                        </NThing>
                    </NGi>
                    <NGi>
                        <NThing>
                            <template #header>
                                <NStatistic label="点击率">
                                    <template #prefix>
                                        <NIcon color="green" :component="BalloonOutline"></NIcon>
                                    </template>
                                    <template #suffix>
                                        / {{ statistics?.num_send }}
                                    </template>
                                    <NNumberAnimation :from="0" :to="statistics?.num_click"></NNumberAnimation>
                                </NStatistic>
                            </template>
                            <template #header-extra>
                                {{ ((statistics?.num_click || 0) / (statistics?.num_send || 0) * 100).toFixed(2) }}%
                            </template>
                        </NThing>
                    </NGi>
                    <NGi>
                        <NThing>
                            <template #header>
                                <NStatistic label="完整阅读率">
                                    <template #prefix>
                                        <NIcon color="green" :component="BalloonOutline"></NIcon>
                                    </template>
                                    <template #suffix>
                                        / {{ statistics?.num_confirm }}
                                    </template>
                                    <NNumberAnimation :from="0" :to="statistics?.num_read"></NNumberAnimation>
                                </NStatistic>
                            </template>
                            <template #header-extra>
                                {{ ((statistics?.num_read || 0) / (statistics?.num_confirm || 0) * 100).toFixed(2) }}%
                            </template>
                        </NThing>
                    </NGi>
                </NGrid>
            </div>
        </div>
        <div class="content">
            <div class="mx5">
                <NGrid cols="1">
                    <NGi v-for="task in statistics?.task_statistics">
                        <NThing>
                            <template #header>
                                <NStatistic :label="'事项' + task.title + '完成率'">
                                    <template #prefix>
                                        <NIcon color="green" :component="ListOutline"></NIcon>
                                    </template>
                                    <template #suffix>
                                        / {{ task?.total }}
                                    </template>
                                    <NNumberAnimation :from="0" :to="task?.done"></NNumberAnimation>
                                </NStatistic>
                            </template>
                            <template #header-extra>
                                {{ ((task?.done || 0) / (task?.total || 0) * 100).toFixed(2) }}%
                            </template>
                        </NThing>
                    </NGi>
                </NGrid>
            </div>
        </div>
        <div class="mx5">
            <NButton type="warning" @click="showUnconfirmed = true">查看未确认人员</NButton>
            <NButton type="error" @click="showUnread = true">查看未读人员</NButton>
        </div>
        <NDrawer v-model:show="showUnread" width="100%">
            <NDrawerContent title="未读" closable>
                <NInputGroup class="mb5">
                    <NInput round v-model:value="unreadSearch"></NInput>
                    <NButton :disabled="loading" round type="primary" @click="searchUnread">搜索</NButton>
                </NInputGroup>
                <NThing v-for="item in statistics?.unread">
                    <template #avatar>
                        <NAvatar :size="48" :src="item.user.profile.avatar"></NAvatar>
                    </template>
                    <template #header>
                        <NText>{{ item.name }}</NText>
                    </template>
                    <template #description>
                        <NTag size="small" v-if="item.is_manager" type="error">{{ item.role }}</NTag>
                        <NTag size="small" v-else type="success">{{ item.role }}</NTag>
                    </template>
                    <template #header-extra>
                        <NButton type="error" size="small" @click="warnUser(item.user_id)">
                            <NIcon :component="NotificationsOutline"></NIcon>
                            加急催促
                        </NButton>
                    </template>
                </NThing>
                <NButton class="mt3" v-if="!unreadSearch" :disabled="loading" block type="primary" @click="loadMoreUnread">
                    <template #icon>
                        <NIcon :component="Refresh"></NIcon>
                    </template>
                    加载更多
                </NButton>
            </NDrawerContent>
        </NDrawer>
        <NDrawer v-model:show="showUnconfirmed" width="100%">
            <NDrawerContent title="未确认" closable>
                <NInputGroup class="mb5">
                    <NInput round v-model:value="unconfirmedSearch"></NInput>
                    <NButton :disabled="loading" round type="primary" @click="searchUnconfirmed">搜索</NButton>
                </NInputGroup>
                <NThing v-for="item in statistics?.unconfirmed">
                    <template #avatar>
                        <NAvatar :size="48" :src="item.user.profile.avatar"></NAvatar>
                    </template>
                    <template #header>
                        <NText>{{ item.name }}</NText>
                    </template>
                    <template #description>
                        <NTag size="small" v-if="item.is_manager" type="error">{{ item.role }}</NTag>
                        <NTag size="small" v-else type="success">{{ item.role }}</NTag>
                    </template>
                    <template #header-extra>
                        <NButton type="error" size="small" @click="warnUser(item.user_id)">
                            <NIcon :component="NotificationsOutline"></NIcon>
                            加急催促
                        </NButton>
                    </template>
                </NThing>
                <NButton class="mt3" v-if="!unconfirmedSearch" :disabled="loading" block type="primary" @click="loadMoreUnconfirmed">
                    <template #icon>
                        <NIcon :component="Refresh"></NIcon>
                    </template>
                    加载更多
                </NButton>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { 
    apiNotificationStatistics,
    apiNotificationStatisticsSearchUnread,
    apiNotificationStatisticsSearchUnconfirmed
} from '../../interface/notification'
import { NAvatar, NButton, NButtonGroup, NDrawer, NDrawerContent, NEllipsis, NGi, NGrid, NH2, NIcon, NInput, NInputGroup, NNumberAnimation, NStatistic, NTag, NText, NThing, NTime, useLoadingBar, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue';
import { Notification, User, OrganizationMember } from '../../interface/typ'
import { BalloonOutline, CaretUpCircleOutline, CellularOutline, Checkmark, CheckmarkDone, HeartCircle, ListCircleOutline, ListOutline, NotificationsOutline, Push, Refresh } from '@vicons/ionicons5';

const route = useRoute()
const router = useRouter()
const message = useMessage()
const loadingBar = useLoadingBar()

const nid = ref(parseInt(route.params.nid as string))

const showUnread = ref(false)
const unreadSearch = ref('')
const unreadPage = ref(1)
const showUnconfirmed = ref(false)
const unconfirmedSearch = ref('')
const unconfirmedPage = ref(1)
const loading = ref(false)

const statistics = ref<{
    num_send: number,
    num_read: number,
    num_confirm: number,
    num_view: number,
    num_like: number,
    num_click: number,
    unread: OrganizationMember[],
    unconfirmed: OrganizationMember[],
    notification: Notification,
    task_statistics: {
        done: number,
        task_id: number,
        title: string,
        total: number,
    }[]
}>()

const loadNotificationStatistics = async () => {
    loadingBar.start()
    loading.value = true
    const response = await apiNotificationStatistics(nid.value, true, 1, true, 1)
    loadingBar.finish()
    loading.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    statistics.value = response.data
}

const loadMoreUnread = async () => {
    loadingBar.start()
    loading.value = true
    const response = await apiNotificationStatistics(nid.value, true, unreadPage.value + 1, false, 0)
    loadingBar.finish()
    loading.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (!statistics.value) {
        return
    }

    statistics.value.unread.push(...response.data?.unread || [])
}

const loadMoreUnconfirmed = async () => {
    loadingBar.start()
    loading.value = true
    const response = await apiNotificationStatistics(nid.value, false, 0, true, unconfirmedPage.value + 1)
    loadingBar.finish()
    loading.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (!statistics.value) {
        return
    }

    unconfirmedPage.value += 1

    statistics.value.unconfirmed.push(...response.data?.unconfirmed || [])
}

const searchUnread = async () => {
    unreadPage.value = 0
    loadingBar.start()
    loading.value = true
    const response = await apiNotificationStatisticsSearchUnread(nid.value, 1, unreadSearch.value)
    loadingBar.finish()
    loading.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (!statistics.value) {
        return
    }

    statistics.value.unread = response.data?.unread || []
}

const searchUnconfirmed = async () => {
    unconfirmedPage.value = 0
    loadingBar.start()
    loading.value = true
    const response = await apiNotificationStatisticsSearchUnconfirmed(nid.value, 1, unconfirmedSearch.value)
    loadingBar.finish()
    loading.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (!statistics.value) {
        return
    }

    statistics.value.unconfirmed = response.data?.unconfirmed || []
}

const warnUser = async (user_id: number) => {
    message.info('该功能尚未实现')
}

onMounted(() => {
    if (!nid.value) {
        router.back()
        return
    }
    loadNotificationStatistics()
})

onBeforeRouteLeave((to, from, next) => {
    if (showUnread.value || showUnconfirmed.value) {
        showUnread.value = false
        showUnconfirmed.value = false
        next(false)
    } else {
        next()
    }
})

</script>

<style scoped>

.b-v-notification-statistics {
    min-height: 100%;
    background-color: white;
}

</style>