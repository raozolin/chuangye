<template>
    <div class="b-v-organization-public-detail">
        <div class="header" :style="{
            backgroundImage: 'url(' + getAssetsFile('billboards-head-top-16x4.jpg') + ')'
        }"></div>
        <div class="avatar">
            <NBadge v-if="profile?.is_official" color="green" :offset="[0, 60]">
                <template #value>
                    <NIcon :component="CheckmarkDoneOutline"></NIcon>
                </template>
                <NAvatar round :size="72" @click="clickAvatar" :src="profile.avatar"></NAvatar>
            </NBadge>
            <NAvatar v-else round :size="72" @click="clickAvatar" :src="profile?.avatar"></NAvatar>
        </div>
        <div class="content">
            <NThing>
                <template #header style="align-items:baseline;">
                    <div style="margin-top: 40px; margin-left: 16px;">
                        <NEllipsis class="text-18" style="max-width: 45vw;" line-clamp="2">
                            {{ profile?.name }}
                        </NEllipsis>
                    </div>
                </template>
                <template #header-extra>
                    <div class="text-center header-extra">
                        <NButton size="small" :color="isLiked ? 'rgb(255,182,193)' : 'rgb(212,105,105)'"
                            :disabled="isLikking" @click="isLiked ? dislike() : like()" text>
                            <template #icon>
                                <NIcon :size="24" :component="HeartCircleOutline"></NIcon>
                            </template>
                        </NButton>
                        <div>
                            {{ profile?.profile.likes }}
                        </div>
                        <div>
                            喜欢
                        </div>
                    </div>
                    <div class="text-center header-extra">
                        <NIcon :size="24" color="green" :component="PeopleCircleOutline"></NIcon>
                        <div>
                            {{ profile?.profile.members }} / {{ profile?.profile.max_members }}
                        </div>
                        <div>
                            成员
                        </div>
                    </div>
                    <div class="text-center header-extra">
                        <NButton text size="small" :color="isFollowed ? 'rgb(194,212,255)' : '#3f7ee8'"
                            :disabled="isFollowing" @click="isFollowed ? unfollow() : follow()">
                            <template #icon>
                                <NIcon :size="24" :component="PulseSharp"></NIcon>
                            </template>
                        </NButton>
                        <div>
                            {{ profile?.profile.attentions }}
                        </div>
                        <div>
                            关注
                        </div>
                    </div>
                </template>
                <template #action v-if="!alreayJoin">
                    <NButton class="w100" type="primary" round :disabled="alreayJoin" @click="requestJoin">
                        <template #icon>
                            <NIcon :component="CheckboxOutline"></NIcon>
                        </template>
                        {{ alreayJoin ? '已加入' : '申请加入' }}
                    </NButton>
                </template>
                <div style="background-color: white; border-radius: 12px;" class="px3 py3">
                    <NDivider title-placement="left" style="font-size: 12px; margin-top: 2px; margin-bottom: 8px;">简介
                    </NDivider>
                    <div class="px5">
                        {{ profile?.description }}
                    </div>
                    <NDivider style="margin-top: 8px; margin-bottom: 8px;"></NDivider>
                    <div class="px5">
                        <NGrid cols="4" class="text-center">
                            <NGi>
                                <NTooltip trigger="click">
                                    <template #trigger>
                                        <div>
                                            <NIcon :size="24" color="green" :component="TimeOutline"></NIcon>
                                            <div>
                                                {{ new Date(profile?.created_at || 0).toLocaleDateString() }}
                                            </div>
                                        </div>
                                    </template>
                                    创建时间
                                </NTooltip>
                            </NGi>
                            <NGi>
                                <NTooltip trigger="click">
                                    <template #trigger>
                                        <div>
                                            <NIcon :size="24" color="green" :component="IdCardOutline"></NIcon>
                                            <div>
                                                {{ profile?.id }}
                                            </div>
                                        </div>
                                    </template>
                                    组织 ID
                                </NTooltip>
                            </NGi>
                            <NGi v-if="isManager">
                                <div @click="invite">
                                    <NIcon :size="24" color="green" :component="PersonAddOutline"></NIcon>
                                    <div>
                                        邀请
                                    </div>
                                </div>
                            </NGi>
                            <NGi v-else>
                                <NTooltip trigger="click">
                                    <template #trigger>
                                        <div>
                                            <NIcon :size="24" color="green" :component="NotificationsCircleOutline"></NIcon>
                                            <div>
                                                {{ profile?.profile.notifications }}
                                            </div>
                                        </div>
                                    </template>
                                    通知数
                                </NTooltip>
                            </NGi>
                            <NGi>
                                <div @click="share">
                                    <NIcon :size="24" color="green" :component="ShareSocial"></NIcon>
                                    <div>
                                        分享
                                    </div>
                                </div>
                            </NGi>
                        </NGrid>
                    </div>
                </div>
            </NThing>
            <div v-if="isManager" class="px3 py3 mt4" style="background-color: white; border-radius: 12px;">
                <NDivider title-placement="left" style="font-size: 12px; margin-top: 2px; margin-bottom: 8px;">管理</NDivider>
                <NGrid cols="3" class="text-center" y-gap="24">
                    <NGi>
                        <div @click="toJoinRequests">
                            <NIcon :size="24" color="green" :component="CreateOutline"></NIcon>
                        </div>
                        <div>
                            申请加入审批
                        </div>
                    </NGi>
                    <NGi>
                        <div @click="toSettings">
                            <NIcon :size="24" color="green" :component="SettingsOutline"></NIcon>
                        </div>
                        <div>
                            组织设置
                        </div>
                    </NGi>
                    <NGi>
                        <div @click="toEditProfile">
                            <NIcon :size="24" color="green" :component="OptionsOutline"></NIcon>
                        </div>
                        <div>
                            组织资料编辑
                        </div>
                    </NGi>
                    <NGi @click="toMembers">
                        <div>
                            <NIcon :size="24" color="green" :component="ManOutline"></NIcon>
                        </div>
                        <div>
                            成员管理
                        </div>
                    </NGi>
                    <NGi @click="toAllNotifications(true)">
                        <div>
                            <NIcon :size="24" color="green" :component="MailOpenOutline"></NIcon>
                        </div>
                        <div>
                            通知管理
                        </div>
                    </NGi>
                    <NGi @click="toOfficial">
                        <div>
                            <NIcon :size="24" color="green" :component="CheckmarkDoneOutline"></NIcon>
                        </div>
                        <div>
                            官方认证
                        </div>
                    </NGi>
                </NGrid>
            </div>
        </div>
        <div class="notifications mx3">
            <NCard size="small" v-for="n in profile?.notifications" :bordered="false" embedded class="mb3">
                <NThing>
                    <template #header>
                        <NEllipsis style="max-width: 50vw;" class="text-14">
                            {{ n.title }}
                        </NEllipsis>
                    </template>
                    <template #header-extra>
                        <NTime :time="new Date(n.start_at || 0)" :to="new Date()" type="relative"></NTime>
                    </template>
                    <template #description>
                        <NEllipsis style="max-width: 70vw;" line-clamp="2" class="text-13">
                            {{ n.body.slice(0, 40) }}
                        </NEllipsis>
                    </template>
                </NThing>
            </NCard>
            <NEmpty class="mb5">
                <template #icon>
                    <NIcon :component="FishOutline"></NIcon>
                </template>
                <template #extra>
                    <NButton v-if="isMember" type="primary" size="small" @click="toAllNotifications()">
                        <template #icon>
                            <NIcon :component="NotificationsCircleOutline"></NIcon>
                        </template>
                        查看全部
                    </NButton>
                </template>
                最多只展示最近的 10 条通知
            </NEmpty>
        </div>
        <NDrawer v-model:show="showManagerDrawer" placement="bottom">
            <NDrawerContent>
                <NGrid cols="3" class="text-center" y-gap="24">
                    <NGi>
                        <div @click="toJoinRequests">
                            <NIcon :size="24" color="green" :component="CreateOutline"></NIcon>
                        </div>
                        <div>
                            申请加入审批
                        </div>
                    </NGi>
                    <NGi>
                        <div @click="toSettings">
                            <NIcon :size="24" color="green" :component="SettingsOutline"></NIcon>
                        </div>
                        <div>
                            组织设置
                        </div>
                    </NGi>
                    <NGi>
                        <div @click="toEditProfile">
                            <NIcon :size="24" color="green" :component="OptionsOutline"></NIcon>
                        </div>
                        <div>
                            组织资料编辑
                        </div>
                    </NGi>
                    <NGi @click="toMembers">
                        <div>
                            <NIcon :size="24" color="green" :component="ManOutline"></NIcon>
                        </div>
                        <div>
                            成员管理
                        </div>
                    </NGi>
                    <NGi @click="toAllNotifications(true)">
                        <div>
                            <NIcon :size="24" color="green" :component="MailOpenOutline"></NIcon>
                        </div>
                        <div>
                            通知管理
                        </div>
                    </NGi>
                    <NGi @click="toOfficial">
                        <div>
                            <NIcon :size="24" color="green" :component="CheckmarkDoneOutline"></NIcon>
                        </div>
                        <div>
                            官方认证
                        </div>
                    </NGi>
                </NGrid>
            </NDrawerContent>
        </NDrawer>
        <NDrawer v-model:show="showShareDrawer" placement="bottom" height="400">
            <NDrawerContent closable>
                <NH2 prefix="bar">
                    <NText type="primary">
                        分享
                    </NText>
                </NH2>
                <NGrid cols="2">
                    <NGi>
                        <div class="text-center">
                            组织首页
                        </div>
                        <NImage class="share-img" :src="shareOrganizationDetailDataURL"></NImage>
                    </NGi>
                    <NGi>
                        <div class="text-center">
                            通知页
                        </div>
                        <NImage class="share-img" :src="shareOrganizationNotificationsDataURL"></NImage>
                    </NGi>
                </NGrid>
            </NDrawerContent>
        </NDrawer>
        <NDrawer v-model:show="showInviteDrawer" placement="bottom" height="400">
            <NDrawerContent title="邀请新成员加入" closable>
                <NH2 prefix="bar">
                    <NText type="primary">
                        邀请
                    </NText>
                </NH2>
                <NGrid cols="4">
                    <NGi :span="1"></NGi>
                    <NGi :span="2">
                        <div class="text-center">
                            使用发布册App扫码加入 <br> 二维码十分钟后失效
                        </div>
                        <NImage class="share-img" :src="inviteOrganizationNotificationsDataURL"></NImage>
                    </NGi>
                    <NGi :span="1"></NGi>
                </NGrid>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import {
    apiOrganizationProfile, apiOrganizationJoinRequest,
    apiOrganizationLike, apiOrganizationDislike,
    apiOrganizationFollow, apiOrganizationUnfollow,
    apiOrganizationInvite
} from '../../interface/organization'
import { Organization } from '../../interface/typ'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { NAvatar, NBadge, NButton, NCard, NCollapse, NCollapseItem, NDivider, NDrawer, NDrawerContent, NEllipsis, NEmpty, NForm, NFormItem, NGi, NGrid, NH2, NIcon, NImage, NInput, NSpace, NText, NThing, NTime, NTooltip, useDialog, useLoadingBar, useMessage } from 'naive-ui'
import { getAssetsFile } from '../../utils'
import {
    CheckboxOutline,
    CheckmarkDoneOutline,
    CreateOutline,
    FishOutline,
    HeartCircleOutline, IdCardOutline, MailOpenOutline, ManOutline, NotificationsCircleOutline, OptionsOutline,
    PeopleCircleOutline, PersonAddOutline, PulseSharp, SettingsOutline, Share, ShareSocial, TimeOutline
} from '@vicons/ionicons5'
import QRCode from 'qrcode'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../store/user'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const loadingBar = useLoadingBar()
const dialog = useDialog()

const { UserName } = storeToRefs(useUserStore())

const oid = ref(0)
const profile = ref<Organization>()

const unwatch = watch(() => route.params.oid, (newVal) => {
    setTimeout(() => {
        const id = parseInt(newVal as string)
        if (id) {
            oid.value = id
            loadProfile()
        } else {
            router.back()
        }
    })
}, { immediate: true })
onBeforeRouteLeave(() => {
    unwatch()
})

const alreayJoin = computed(() => {
    return profile.value?.users && profile.value?.users.length > 0
})

const isManager = computed(() => {
    return profile.value?.users && profile.value?.users.length > 0 && profile.value?.users[0].is_manager
})

const isLiked = computed(() => {
    return profile.value?.likes && profile.value?.likes.length > 0
})

const isMember = computed(() => {
    return profile.value?.users && profile.value?.users.length > 0
})

const showManagerDrawer = ref(false)
const clickAvatar = () => {
    if (isManager.value) {
        showManagerDrawer.value = true
    }
}

const isLikking = ref(false)
const like = async () => {
    isLikking.value = true
    const response = await apiOrganizationLike(oid.value)
    isLikking.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadProfile()
}
const dislike = async () => {
    isLikking.value = true
    const response = await apiOrganizationDislike(oid.value)
    isLikking.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadProfile()
}

const isFollowed = computed(() => {
    return profile.value?.followers && profile.value?.followers.length > 0
})
const isFollowing = ref(false)
const follow = async () => {
    isFollowing.value = true
    const response = await apiOrganizationFollow(oid.value)
    isFollowing.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadProfile()
}
const unfollow = async () => {
    isFollowing.value = true
    const response = await apiOrganizationUnfollow(oid.value)
    isFollowing.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadProfile()
}

const loadProfile = async () => {
    isFollowing.value = false
    isLikking.value = false
    loadingBar.start()
    const response = await apiOrganizationProfile(oid.value)
    loadingBar.finish()
    isFollowing.value = false
    isLikking.value = false
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    profile.value = response.data?.organization || undefined
}

const requestJoin = async () => {
    const name = ref(UserName.value)
    dialog.success({
        title: '申请加入',
        content: () => h(NForm, {}, {
            default: () => [
                h(NFormItem, { label: '在该组织中您想被怎么称呼？比如在娱乐行业，可以填写为艺名；在政府机构，需要是真名；' }, {
                    default: () => h(NInput, {
                        value: name.value,
                        onUpdateValue: (v) => { name.value = v }
                    })
                })
            ]
        }),
        positiveText: '确定',
        onPositiveClick: async () => {
            const response = await apiOrganizationJoinRequest(oid.value, name.value)
            if (!response.isSuccess()) {
                message.error(response.getError())
                return
            }

            message.success('申请成功，等待审批')
        }
    })
}

const showShareDrawer = ref(false)
const shareOrganizationDetailDataURL = ref('')
const shareOrganizationNotificationsDataURL = ref('')
const share = async () => {
    showShareDrawer.value = true
    const frontUrl = (import.meta as any).env.VITE_APP_FRONTEND_BASE_URL
    const detail = await QRCode.toDataURL(`${frontUrl}/organization/detail/${oid.value}`)
    const notifications = await QRCode.toDataURL(`${frontUrl}/organization/bulk_notifications/${oid.value}`)
    shareOrganizationDetailDataURL.value = detail
    shareOrganizationNotificationsDataURL.value = notifications
}

const inviteOrganizationNotificationsDataURL = ref('')
const showInviteDrawer = ref(false)
const invite = async () => {
    const response = await apiOrganizationInvite(oid.value)
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    showInviteDrawer.value = true
    const frontUrl = (import.meta as any).env.VITE_APP_FRONTEND_BASE_URL
    const notifications = await QRCode.toDataURL(`${frontUrl}/organization/invite/${oid.value}?code=${response.data?.invite_code}`)
    inviteOrganizationNotificationsDataURL.value = notifications
}

const toJoinRequests = () => {
    router.push(`/organization/join_request/${oid.value}`)
}

const toSettings = () => {
    router.push(`/organization/settings/${oid.value}`)
}

const toMembers = () => {
    router.push(`/organization/members/${oid.value}`)
}

const toEditProfile = () => {
    router.push(`/organization/profile/${oid.value}`)
}

const toAllNotifications = (is_manager: boolean = false) => {
    router.push(`/organization/bulk_notifications/${oid.value}?is_manager=${is_manager}`)
}

const toOfficial = () => {
    router.push(`/organization/official/${oid.value}`)
}

</script>

<style scoped>
.b-v-organization-public-detail {
    height: calc(100vh - var(--header-height));
    width: 100%;
    position: relative;
}

.header {
    height: 120px;
    width: 100%;
    background-size: cover;
    background-position: center;
}

.content {
    padding: 8px;
}

.notifications {
    padding: 8px;
    border-radius: 12px;
    background-color: white;
}

.header-extra {
    width: 60px;
    display: inline-block;
}

.avatar {
    position: absolute;
    top: calc(120px - 48px + 20px);
    left: 18px;
}

.title {
    margin-left: 100px;
}

.share-img {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 150px;
    text-align: center;
    margin: 0 auto;
}
</style>