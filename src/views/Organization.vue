<template>
    <div class="b-v-home">
        <NTabs class="px5" animated>
            <NTabPane v-if="UserOrganizations" :name="`已加入(${UserOrganizations.length})`">
                <NThing class="mb4" v-for="(m, k) in UserOrganizations" @click="toOrganizationNotifications(m.id)" :key="k">
                    <template #avatar>
                        <NBadge :value="(m.unconfirmed || 0) + (m.undone || 0)" :max="99" :offset="[-5, 5]">
                            <NAvatar :src="m.avatar" round :size="48"></NAvatar>
                        </NBadge>
                    </template>
                    <template #header-extra>
                        <NButton text type="primary">
                            <template #icon>
                                <NIcon :component="ChevronForwardCircleOutline" @click="toOrganizationNotifications(m.id)"></NIcon>
                            </template>
                            查看
                        </NButton>
                    </template>
                    <template #header>
                        <div>
                            {{ m.name }}
                        </div>
                    </template>
                    <template #description>
                        <NTag :bordered="false" size="small" type="info">
                            <template #icon>
                                <NIcon :component="Notifications"></NIcon>
                            </template>
                            {{ m.unconfirmed }} 个未确认通知
                        </NTag>
                        <NTag :bordered="false" size="small" type="warning">
                            <template #icon>
                                <NIcon :component="List"></NIcon>
                            </template>
                            {{ m.undone }} 条未完成事项
                        </NTag>
                    </template>
                </NThing>
            </NTabPane>
            <NTabPane v-if="UserFollowingOrganizations" :name="`已关注(${UserFollowingOrganizations.length})`">
                <NThing class="mb4" v-for="(m, k) in UserFollowingOrganizations" @click="toOrganizationNotifications(m.id)" :key="k">
                    <template #avatar>
                        <NBadge :value="(m.unconfirmed || 0) + (m.undone || 0)" :max="99" :offset="[-5, 5]">
                            <NAvatar :src="m.avatar" round :size="48"></NAvatar>
                        </NBadge>
                    </template>
                    <template #header-extra>
                        <NButton text type="primary">
                            <NIcon :size="24" :component="ChevronForwardCircleOutline" @click="toOrganizationNotifications(m.id)"></NIcon>
                        </NButton>
                    </template>
                    <template #header>
                        <div>
                            {{ m.name }}
                        </div>
                    </template>
                    <template #description>
                        <NTag :bordered="false" size="small" type="info">
                            <template #icon>
                                <NIcon :component="Notifications"></NIcon>
                            </template>
                            {{ m.unconfirmed }} 个未确认通知
                        </NTag>
                        <NTag :bordered="false" size="small" type="warning">
                            <template #icon>
                                <NIcon :component="List"></NIcon>
                            </template>
                            {{ m.undone }} 条未完成事项
                        </NTag>
                    </template>
                </NThing>
            </NTabPane>
            <NTabPane v-if="UserManagingOrganizations" :name="`我管理的(${UserManagingOrganizations.length})`">
                <NThing class="mb4" v-for="(m, k) in UserOrganizations" @click="toOrganizationNotifications(m.id)" :key="k">
                    <template #avatar>
                        <NBadge :value="(m.unconfirmed || 0) + (m.undone || 0)" :max="99" :offset="[-5, 5]">
                            <NAvatar :src="m.avatar" round :size="48"></NAvatar>
                        </NBadge>
                    </template>
                    <template #header-extra>
                        <NButton text type="primary">
                            <template #icon>
                                <NIcon :size="24" :component="ChevronForwardCircleOutline" @click="toOrganizationNotifications(m.id)"></NIcon>
                            </template>
                        </NButton>
                    </template>
                    <template #header>
                        <div>
                            {{ m.name }}
                        </div>
                    </template>
                    <template #description>
                        <NTag :bordered="false" size="small" type="info">
                            <template #icon>
                                <NIcon :component="Notifications"></NIcon>
                            </template>
                            {{ m.unconfirmed }} 个未确认通知
                        </NTag>
                        <NTag :bordered="false" size="small" type="warning">
                            <template #icon>
                                <NIcon :component="List"></NIcon>
                            </template>
                            {{ m.undone }} 条未完成事项
                        </NTag>
                    </template>
                </NThing>
            </NTabPane>
        </NTabs>
    </div>
</template>

<script setup lang="ts">
import {
    ChevronForwardCircleOutline,
    List,
    Notifications,
} from '@vicons/ionicons5'
import {
    NAvatar, NBadge, NButton, NEllipsis, NEmpty, NGi, NGrid,
    NIcon, NList, NListItem, NTabPane, NTabs, NTag, NText, NThing
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '../store/user'
import { refreshOrganizationNotificationStatistics } from '../store/notification'
import { useRouter } from 'vue-router'
import { onCheckedLogin } from '../middleware/auth/login'

onMounted(() => {
    refreshOrganizationNotificationStatistics()
})

const router = useRouter()

const visible = defineModel<boolean>('visible', { required: true, default: false, local: false })

const close = () => {
    visible.value = false
}

const toLogin = () => {
    close()
    router.push('/login')
}

const toProfile = () => {
    close()
    router.push('/user/profile')
}

const toSettings = () => {
    close()
    router.push('/settings')
}

const toOrganizationNotifications = (oid: number) => {
    close()
    router.push(`/organization/notifications/${oid}`)
}

const userStore = useUserStore()

const {
    UserOnline,
    UserOrganizations, UserFollowingOrganizations, UserManagingOrganizations
} = storeToRefs(userStore)

onMounted(() => {
    onCheckedLogin(() => {
        if (!UserOnline.value) {
            toLogin()
        }
    })
})


</script>

<style scoped>
.b-v-home {
    background-color: white;
    min-height: 100%;
}
</style>