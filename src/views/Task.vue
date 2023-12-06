<template>
    <div class="b-v-task">
        <NGrid cols="12">
            <NGi span="2" class="ml5">
                <Filter task @update="handleFilterUpdate" />
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
            <NCard v-if="tasks.length == 0">
                <NEmpty description="您还没有加入任何组织，或已加入的组织未发送任何通知">
                    <template #extra>
                        <NGrid cols="2" class="mt5">
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
                        </NGrid>
                    </template>
                </NEmpty>
            </NCard>
            <div>
                <NGrid cols="1 s:2 m:2 l:3 xl:3 2xl:3" responsive="screen">
                    <NGi v-for="task, k in tasks" :key="k">
                        <NCard size="small" class="clickable" :bordered="false" >
                            <NThing content-indented>
                                <template #header>
                                    <NEllipsis style="max-width: 50vw;">
                                        <span @click="toDetail(task)">
                                            {{ task.organization?.name }}
                                        </span>
                                    </NEllipsis>
                                </template>
                                <template #header-extra>
                                    <NTime 
                                        v-if="((new Date()).getTime() - (task.task?.start_at || 0)) < 86400000"
                                        style="font-size: 12px;" :time="new Date(task.task?.start_at || 0)"
                                        format="H:mm">
                                    </NTime>
                                    <NTime 
                                        v-else
                                        style="font-size: 12px;" :time="new Date(task.task?.start_at || 0)" :to="new Date()"
                                        type="relative">
                                    </NTime>
                                </template>
                                <template #avatar>
                                    <NAvatar :size="48" round :src="task?.organization?.avatar"></NAvatar>
                                </template>
                                <template #footer>
                                    <div class="left" @click="toDetail(task)">
                                        {{ task.task?.body.slice(0, 40) }}
                                    </div>
                                    <NButton class="right" size="small" text :type="task.is_done ? 'info' : 'error'" @click="toDetail(task)">
                                        <template #icon>
                                            <NIcon :component="EnterOutline"></NIcon>
                                        </template>
                                        前往
                                    </NButton>
                                </template>
                            </NThing>
                        </NCard>
                    </NGi>
                </NGrid>
            </div>
        </PullRefresh>
    </div>
</template>

<script setup lang="ts">
// TODO: virtual list, but not now, we need efficient
import { computed, onMounted, ref } from 'vue'
import {
    notificationDatabase,
    syncNotification
} from '../store/notification'
import {
    UserTask
} from '../interface/typ'
import { NAvatar, NButton, NCard, NEllipsis, NEmpty, NGi, NGrid, NIcon, NThing, NTime, useMessage, useNotification } from 'naive-ui'
import { EnterOutline, Location, Search } from '@vicons/ionicons5'
import Filter from '../component/Filter.vue'
import { FilterOptions } from '../component/Filter'
// @ts-ignore
import PullRefresh from 'pull-refresh-vue3'
import { useRouter } from 'vue-router'
import { useScroll } from '../layout/event'
import { onCheckedLogin } from '../middleware/auth/login'
import { useUserStore } from '../store/user'
import { storeToRefs } from 'pinia'
import { loadTask } from './Notification'

const notification = useNotification()
const router = useRouter()

const tasks = ref<UserTask[]>([])

const tasksMap = computed(() => {
    const map = new Map<number, boolean>()
    tasks.value.forEach((task) => {
        map.set(task.id, true)
    })
    return map
})

const filter = ref<FilterOptions>()
const handleFilterUpdate = (_filter: FilterOptions) => {
    filter.value = _filter
    tasks.value = []
    loadPage.value = 0
    loadLastLoaded.value = 1
    loadLocalLatestTasks({calledByFilter: true})
}
const loading = ref(false)
const loadPage = ref(0)
const loadLastLoaded = ref(1)
const loadLocalLatestTasks = async (options: {
    calledByFilter: boolean
} = {
    calledByFilter: false
}) => {
    if (loadLastLoaded.value == 0) {
        return
    }

    loadLastLoaded.value = 0

    let isFirstLoad = true // callback will be called multiple times, but we should empty notifications only once

    await loadTask(
        (task: UserTask) => {
            if (isFirstLoad) {
                if (options.calledByFilter) {
                    tasks.value = []
                }
                isFirstLoad = false
            }
            tasks.value.push(task)
            loadLastLoaded.value += 1
        },
        filter.value || {} as FilterOptions,
        loadPage.value,
    )

    if (isFirstLoad && options.calledByFilter) {
        tasks.value = []
    }
}
const handleScroll = () => {
    loadPage.value += 1
    loadLocalLatestTasks()
}
onMounted(() => {
    useScroll({ onBottom: handleScroll })
    notificationDatabase.user_tasks.hook('updating', function(mods, key, obj, trans) {
        if (tasksMap.value.has(key)) {
            const taskIndex = tasks.value.findIndex((task) => task.id == key)
            if (taskIndex != -1) {
                if (mods.hasOwnProperty('is_done')) {
                    // @ts-ignore
                    tasks.value[taskIndex].is_done = mods.is_done
                }
            }
        }
    })
    notificationDatabase.user_tasks.hook('creating', function(key, obj) {
        loadPage.value = 0
        loadLastLoaded.value = 1
        tasks.value = []
        loadLocalLatestTasks()
    })
})

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
            tasks.value = []
            loadLocalLatestTasks()
        }, 500)
    }
    loading.value = false
}

const { UserOnline } = storeToRefs(useUserStore())

onMounted(() => {
    onCheckedLogin(() => {
        if (!UserOnline.value) {
            router.push('/login')
        } else {
            loadLocalLatestTasks()
            refreshNotifications(false)
        }
    })
})

const toDetail = (task: UserTask) => {
    router.push('/notification/' + task.user_notification_id)
}

</script>

<style scoped>

.b-v-task {
    background-color: white;
    min-height: 100%;
}

.notificatino-card {
    border-radius: 12px;
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