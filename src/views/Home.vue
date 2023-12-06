<template>
    <div class="b-v-home">
        <div class="b-l-sider-header px5 py5">
            <NThing>
                <template #avatar>
                    <NAvatar round :size="52" :src="UserAvatar" @click="UserOnline ? toProfile() : toLogin()"></NAvatar>
                </template>
                <template #header>
                    <NText class="text-white">
                        {{ UserName }}
                    </NText>
                </template>
                <template #header-extra>
                    <span @click="toProfile" class="mr3">
                        <NIcon color="white" :size="24" :component="CreateOutline"></NIcon>
                    </span>
                    <span @click="toSettings">
                        <NIcon color="white" :size="24" :component="SettingsOutline"></NIcon>
                    </span>
                </template>
                <template #description>
                    <NText class="text-white">
                        uid: {{ UserId }}
                    </NText>
                </template>
            </NThing>
        </div>
        <div class="b-l-sider-body">
            <div v-if="!UserOnline">
                <NEmpty class="mt5" description="请先登录"></NEmpty>
            </div>
            <div v-else>
                <NTabs class="px5" animated>
                    <NTabPane v-if="UserOrganizations" :name="`已加入(${UserOrganizations.length})`">
                        <NList class="px5">
                            <NListItem v-for="(m, k) in userOrganizationMessages" @click="toOrganizationDetail(m.id)">
                                <template #prefix>
                                    <NBadge :value="m.org.unconfirmed" :max="99">
                                        <NAvatar :src="m.org.avatar" round :size="24"></NAvatar>
                                    </NBadge>
                                </template>
                                <template #suffix>
                                    <NButton text type="primary" @click="toOrganizationDetail(m.id)">
                                        <NIcon :size="20" :component="ChevronForwardCircleOutline"></NIcon>
                                    </NButton>
                                </template>
                                <NEllipsis>
                                    {{ m.org.name }}
                                </NEllipsis>
                            </NListItem>
                        </NList>
                    </NTabPane>
                    <NTabPane v-if="UserFollowingOrganizations" :name="`已关注(${UserFollowingOrganizations.length})`">
                        <NList class="px5">
                            <NListItem v-for="(m, k) in UserFollowingOrganizations" @click="toOrganizationDetail(m.id)">
                                <template #prefix>
                                    <NBadge :value="m.unconfirmed" :max="99">
                                        <NAvatar :src="m.avatar" round :size="24"></NAvatar>
                                    </NBadge>
                                </template>
                                <template #suffix>
                                    <NButton text type="primary" @click="toOrganizationDetail(m.id)">
                                        <NIcon :size="20" :component="ChevronForwardCircleOutline"></NIcon>
                                    </NButton>
                                </template>
                                <NEllipsis>
                                    {{ m.name }}
                                </NEllipsis>
                            </NListItem>
                        </NList>
                    </NTabPane>
                    <NTabPane v-if="UserManagingOrganizations" :name="`我管理的(${UserManagingOrganizations.length})`">
                        <NList class="px5">
                            <NListItem v-for="(m, k) in UserManagingOrganizations" @click="toOrganizationDetail(m.id)">
                                <template #prefix>
                                    <NBadge :value="m.unconfirmed" :max="99">
                                        <NAvatar :src="m.avatar" round :size="24"></NAvatar>
                                    </NBadge>
                                </template>
                                <template #suffix>
                                    <NButton text type="primary" @click="toOrganizationDetail(m.id)">
                                        <NIcon :size="20" :component="ChevronForwardCircleOutline"></NIcon>
                                    </NButton>
                                </template>
                                <NEllipsis>
                                    {{ m.name }}
                                </NEllipsis>
                            </NListItem>
                        </NList>
                    </NTabPane>
                </NTabs>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ChevronForwardCircleOutline,
    CreateOutline,
    SettingsOutline
} from '@vicons/ionicons5'
import {
    NAvatar, NBadge, NButton, NEllipsis, NEmpty, NGi, NGrid,
    NIcon, NList, NListItem, NTabPane, NTabs, NText, NThing
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

const toOrganizationDetail = (oid: number) => {
    close()
    router.push(`/organization/detail/${oid}`)
}

const userStore = useUserStore()

const {
    UserAvatar, UserName, UserId, UserOnline,
    UserOrganizations, UserFollowingOrganizations, UserManagingOrganizations
} = storeToRefs(userStore)

const userOrganizationMessages = computed(() => {
    if (!UserOrganizations) return []
    return UserOrganizations.value.map((item) => {
        return {
            id: item.id,
            org: item,
            new: 0
        }
    })
})

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
    height: 100%;
    overflow: hidden;
}

.b-l-sider-header {
    background-color: #4b9e5f;
    box-shadow: 10px 10px 10px rgba(74, 69, 69, 0.1);
    margin: 6px;
    border-radius: 5px;
    height: 60px;
}

.b-l-sider-body {
    height: calc(100% - 60px);
    overflow-y: scroll;
}
</style>