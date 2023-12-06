<template>
    <div class="b-v-search">
        <NInputGroup>
            <NInputGroupLabel :bordered="false" style="background-color: white;">
                <Filter notification @update="handleFilterUpdate" />
            </NInputGroupLabel>
            <NInput v-model:value="keyword" placeholder="请输入搜索通知/事项关键词" ref="inputRef"></NInput>
            <NButton type="primary" @click="search">搜索</NButton>
        </NInputGroup>
        <div class="mt5" v-if="notifications.length != 0 || tasks.length != 0">
            <NCollapse v-if="notifications.length" :expanded-names="expandedNames"
                @item-header-click="handleItemHeaderClick">
                <NCollapseItem v-if="notifications.length > 0" :title="`通知(${notifications.length})`" name="notification">
                    <NThing class="mb3 mx2" v-for="notification in notifications" content-indented>
                        <template #header>
                            <NEllipsis style="width: 50vw;" @click="toDetail(notification)">
                                <span>
                                    {{ notification.notification?.organization?.name }}
                                </span>
                            </NEllipsis>
                        </template>
                        <template #header-extra>
                            <NTime :time="new Date(notification.notification?.start_at || 0)" :to="new Date()"
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
                    <template #header-extra>
                        点击展开/收起
                    </template>
                </NCollapseItem>
                <NCollapseItem v-if="tasks.length > 0" :title="`事项(${tasks.length})`" name="task">
                    <NThing v-for="task in tasks" content-indented>
                        <template #header>
                            <NEllipsis style="max-width: 50vw;">
                                <span @click="toTaskDetail(task)">
                                    {{ task.organization?.name }}
                                </span>
                            </NEllipsis>
                        </template>
                        <template #header-extra>
                            <NTime :time="new Date(task.start_at || 0)" :to="new Date()" type="relative"></NTime>
                        </template>
                        <template #avatar>
                            <NAvatar :size="48" round :src="task?.organization?.avatar"></NAvatar>
                        </template>
                        <template #footer>
                            <div class="left" @click="toTaskDetail(task)">
                                {{ task.task?.body.slice(0, 40) }}
                            </div>
                            <NButton class="right" size="small" text :type="task.is_done ? 'info' : 'error'"
                                @click="toTaskDetail(task)">
                                <template #icon>
                                    <NIcon :component="EnterOutline"></NIcon>
                                </template>
                                前往
                            </NButton>
                        </template>
                    </NThing>
                    <template #header-extra>
                        点击展开/收起
                    </template>
                </NCollapseItem>
            </NCollapse>
        </div>
        <NResult v-else status="404" style="margin-top: 80px;" description="什么都没有，请在上方输入正确的关键词并搜索，也可以使用分类按钮进行过滤"></NResult>
    </div>
</template>

<script setup lang="ts">
import {
    CollapseProps,
    InputInst, NAvatar, NButton, NCollapse, NCollapseItem, NDivider,
    NEllipsis, NIcon, NInput, NInputGroup, NInputGroupLabel,
    NResult,
    NTag, NThing, NTime, useMessage
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { FilterOptions } from '../component/Filter'
import { useRouter } from 'vue-router'
import { searchAll } from './Search'
import { UserNotification, UserTask } from '../interface/typ'
import { notificationDatabase } from '../store/notification'
import { apiNotificationClick, apiNotificationConfirm } from '../interface/notification'
import { CheckboxOutline, EnterOutline } from '@vicons/ionicons5'
import Filter from '../component/Filter.vue'

const router = useRouter()
const message = useMessage()

const notifications = ref<UserNotification[]>([])
const tasks = ref<UserTask[]>([])

const showNotification = ref(true)
const showTask = ref(true)
const expandedNames = computed(() => {
    const names: string[] = []
    if (showNotification.value) {
        names.push('notification')
    }
    if (showTask.value) {
        names.push('task')
    }
    return names
})
const handleItemHeaderClick: CollapseProps['onItemHeaderClick'] = ({
    name,
    expanded
}) => {
    if (name == 'notification') {
        showNotification.value = expanded
    } else if (name == 'task') {
        showTask.value = expanded
    }
}

const keyword = ref('')
const search = async () => {
    notifications.value = []
    tasks.value = []
    let notification_collapsed = false
    let task_collapsed = false
    await searchAll(
        (notification) => {
            notifications.value.push(notification)
            if (notifications.value.length > 8 && !notification_collapsed) {
                showNotification.value = false
                notification_collapsed = true
            }
        },
        (task) => {
            tasks.value.push(task)
            if (tasks.value.length > 8 && !task_collapsed) {
                showTask.value = false
                task_collapsed = true
            }
        },
        filter.value || {} as FilterOptions,
        keyword.value
    )
}

const inputRef = ref<InputInst | null>(null)
const focusInput = () => {
    inputRef.value?.focus()
}

onMounted(() => {
    focusInput()
})

const filter = ref<FilterOptions>()
const handleFilterUpdate = (_filter: FilterOptions) => {
    filter.value = _filter
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

const toDetail = (notification: UserNotification) => {
    apiNotificationClick(notification.id)
    router.push('/notification/' + notification.id)
}

const toTaskDetail = (task: UserTask) => {
    router.push('/task/' + task.id)
}

const toOrganization = (id: number) => {
    if (id == 0) {
        return
    }
    router.push(`/organization/detail/${id}`)
}
</script>

<style scoped>
.b-v-search {
    padding: 8px;
    min-height: 100%;
    background-color: white;
}
</style>