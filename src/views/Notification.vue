<template>
    <div class="b-v-notification">
        <NGrid cols="12">
            <NGi span="2" class="ml5">
                <Filter  notification @update="handleFilterUpdate" />
            </NGi>
            <NGi span="10">
                <div class="search">
                    <div class="search-controller">
                        <NButton size="small" block text @click="router.push('/search')">
                            <template #icon>
                                <NIcon :component="Search"></NIcon>
                            </template>
                            搜索
                        </NButton>
                    </div>
                </div>
            </NGi>
        </NGrid>
        <PullRefresh v-model="loading" @refresh="refreshNotifications(true)" style="min-height: 80vh;">
            <NCard v-if="notifications.length == 0">
                <NEmpty description="您还没有加入任何组织，或已加入的组织未发送任何通知">
                    <template #extra>
                        <NGrid cols="2" class="mt5" y-gap="12">
                            <NGi class="mx2">
                                <NButton block type="primary" @click="router.push('/organization/search')">
                                    <NIcon :component="Search"></NIcon>
                                    搜索组织名
                                </NButton>
                            </NGi>
                            <NGi class="mx2">
                                <NButton block type="primary" @click="router.push('/organization/nearby')">
                                    <NIcon :component="Location"></NIcon>
                                    搜索附近组织
                                </NButton>
                            </NGi>
                            <NGi class="mx2" span="2">
                                <NButton block type="primary" @click="router.push('/organization/categories')">
                                    <NIcon :component="BalloonOutline"></NIcon>
                                    综合搜索
                                </NButton>
                            </NGi>
                        </NGrid>
                    </template>
                </NEmpty>
            </NCard>
            <div>
                <div class="clickable my1 py2" style="background-color: white;" v-if="hasNewNotification">
                    <NButton type="warning" class="w100" text
                        @click="hasNewNotification = false; refreshNotifications(true)">
                        <template #icon>
                            <NIcon :component="Refresh"></NIcon>
                        </template>
                        有新通知，点击刷新
                    </NButton>
                </div>
                <NGrid cols="1 s:2 m:2 l:3 xl:3 2xl:3" responsive="screen">
                    <NGi v-for="notification in notifications" style="margin: 0;">
                        <NCard size="small" class="clickable notificatino-card" :bordered="false">
                            <NThing content-indented>
                                <template #header>
                                    <NEllipsis style="width: 50vw;">
                                        <div @click="toDetail(notification)">
                                            {{ notification.notification?.organization?.name }}
                                        </div>
                                    </NEllipsis>
                                </template>
                                <template #header-extra>
                                    <NTime 
                                        v-if="((new Date()).getTime() - (notification?.start_at || 0)) < 86400000"
                                        style="font-size: 12px;" :time="new Date(notification?.start_at || 0)"
                                        format="H:mm">
                                    </NTime>
                                    <NTime 
                                        v-else
                                        style="font-size: 12px;" :time="new Date(notification?.start_at || 0)" :to="new Date()"
                                        type="relative">
                                    </NTime>
                                </template>
                                <template #avatar>
                                    <NAvatar :size="48" round :src="notification.notification?.organization?.avatar"
                                        @click="toOrganization(notification.organization_id || 0)"></NAvatar>
                                </template>
                                <div style="margin-top: -10px;">
                                    <div class="left w60 text-12" @click="toDetail(notification)">
                                        <NTag v-if="notification?.sender_role" :bordered="false" type="info" size="small">{{
                                            notification?.sender_role }}</NTag>
                                        {{ notification.notification?.title.slice(0, 40) }}
                                    </div>
                                    <NButton class="right" size="small" text @click="confirmNotification(notification)"
                                        :type="notification.is_confirmed ? 'primary' : 'error'">
                                        <template #icon>
                                            <NIcon v-if="!notification.is_confirmed" :component="EnterOutline"></NIcon>
                                            <NIcon v-else :component="CheckboxOutline"></NIcon>
                                        </template>
                                        {{ notification.is_confirmed ? '已确认' : '确认' }}
                                    </NButton>
                                </div>
                            </NThing>
                        </NCard>
                    </NGi>
                </NGrid>
                <div class="mb5">
                    <NButton v-if="loadLastLoaded != 0" type="primary" class="w100" text @click="handleScroll">
                        <template #icon>
                            <NIcon :component="Refresh"></NIcon>
                        </template>
                        加载更多
                    </NButton>
                </div>
            </div>
        </PullRefresh>
    </div>
</template>

<script setup lang="ts">
// TODO: virtual list, but not now, we need efficient
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
    notificationDatabase,
    syncNotification
} from '../store/notification'
import {
    UserNotification
} from '../interface/typ'
import {
    NAvatar, NButton, NButtonGroup, NCard, NEllipsis, NEmpty,
    NGi, NGrid, NIcon, NTag, NThing, NTime,
    useMessage, useNotification
} from 'naive-ui'
import { BalloonOutline, CheckboxOutline, EnterOutline, Location, Refresh, Search, ShuffleOutline } from '@vicons/ionicons5'
import {
    apiNotificationConfirm,
    apiNotificationClick
} from '../interface/notification'
import Filter from '../component/Filter.vue'
import { FilterOptions } from '../component/Filter'
// @ts-ignore
import PullRefresh from 'pull-refresh-vue3'
import { useRouter } from 'vue-router'
import { onCheckedLogin } from '../middleware/auth/login'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'
import { messageController } from '../middleware/message/message'
import { loadNotification } from './Notification'

const message = useMessage()
const notification = useNotification()
const router = useRouter()

const notifications = ref<UserNotification[]>([])

const filter = ref<FilterOptions>()
const handleFilterUpdate = (_filter: FilterOptions) => {
    filter.value = _filter
    loadPage.value = 0
    loadLastLoaded.value = 1
    loadLocalLatestNotifications({ calledByFilter: true })
}
const loading = ref(false)
const loadPage = ref(0)
const loadLastLoaded = ref(1) // how many notifications loaded last time
const loadLocalLatestNotifications = async (options: {
    calledByFilter: boolean
} = {
        calledByFilter: false
    }) => {
    if (loadLastLoaded.value == 0) {
        return
    }

    loadLastLoaded.value = 0

    let isFirstLoad = true // callback will be called multiple times, but we should empty notifications only once

    await loadNotification(
        (notification: UserNotification) => {
            if (isFirstLoad) {
                if (options.calledByFilter) {
                    notifications.value = []
                }
                isFirstLoad = false
            }
            notifications.value.push(notification)
            loadLastLoaded.value += 1
        },
        filter.value || {} as FilterOptions,
        loadPage.value,
    )

    if (isFirstLoad && options.calledByFilter) {
        notifications.value = []
    }
}
const handleScroll = () => {
    loadPage.value += 1
    loadLocalLatestNotifications()
}

const refreshNotifications = async (force: boolean = false) => {
    loadPage.value = 0
    loadLastLoaded.value = 1

    const sum = await syncNotification(() => {
        loading.value = true
    }, force)
    if (sum != 0) {
        notification.success({
            title: '同步完成',
            content: '共同步' + sum + '条通知',
            duration: 3000,
        })
        // reload local notifications
        setTimeout(() => {
            notifications.value = []
            loadLocalLatestNotifications()
        })
    }
    messageController.readNotification()
    loading.value = false
}

const confirmNotification = async (notification: UserNotification) => {
    if (notification.is_confirmed) {
        return
    }
    notification.is_confirmed = 1

    await notificationDatabase.user_notifications.update(notification.id, {
        is_confirmed: true,
    })

    const response = await apiNotificationConfirm(notification.id)
    if (!response.isSuccess()) {
        message.error(response.getError())
        notification.is_confirmed = 0
        await notificationDatabase.user_notifications.update(notification.id, {
            is_confirmed: false,
        })
    }
}

const userStore = useUserStore()
const { UserOnline, UserIntro } = storeToRefs(userStore)

onMounted(() => {
    onCheckedLogin(() => {
        if (!UserOnline.value) {
            router.push('/login')
        } else {
            if (!UserIntro.value) {
                router.push('/introduction')
                return
            }
            loadLocalLatestNotifications()
            refreshNotifications(false)
        }
    })
})

const hasNewNotification = ref(false)
const onNewNotification = async () => {
    hasNewNotification.value = true
}
onMounted(() => {
    messageController.onNewNotification(onNewNotification)
})
onBeforeUnmount(() => {
    messageController.offNewNotification(onNewNotification)
})

const toDetail = (notification: UserNotification) => {
    apiNotificationClick(notification.id)
    router.push('/notification/' + notification.id)
}

const toOrganization = (id: number) => {
    if (id == 0) {
        return
    }
    router.push(`/organization/detail/${id}`)
}

</script>

<style scoped>
.b-v-notification {
    min-height: 100%;
    background-color: white;
}

.search {
    margin-left: 12px;
    margin-right: 12px;
    border-radius: 12px;
    background-color: #f0f0eb;
}

.search-controller {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>