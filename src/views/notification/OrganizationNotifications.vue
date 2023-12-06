<template>
    <div class="b-v-notification-organization">
        <div class="header my3 mx5 container-default">
            <NThing content-indented @click="toOrganization">
                <template #avatar>
                    <NAvatar :src="organization?.avatar" round></NAvatar>
                </template>
                <template #header>
                    <NText type="primary">
                        {{ organization?.name }}的通知
                    </NText>
                </template>
                <template #description>
                    <NEllipsis style="max-width: 70vw">
                        {{ organization?.description }}
                    </NEllipsis>
                </template>
            </NThing>
        </div>
        <div class="content mx5 my2 container-default"
            v-for="notification in notifications"
        >
            <NThing class="px2">
                <template #header>
                    <NEllipsis style="max-width: 50vw;">
                        <span>
                            {{ notification?.title }}
                        </span>
                    </NEllipsis>
                </template>
                <template #header-extra>
                    <NTime :time="new Date(notification?.start_at || 0)" :to="new Date()" type="relative"></NTime>
                </template>
                <NBlockquote>
                    {{ notification.body }}
                </NBlockquote>
                <template #footer v-if="isManager">
                    <NButton class="mt1" size="small" type="primary" @click="toStatistics(notification.id)">
                        <template #icon>
                            <NIcon :component="PieChartOutline"></NIcon>
                        </template>
                        统计信息
                    </NButton>
                </template>
            </NThing>
        </div>
        <div class="content mx5 my5">
            <NButton class="w100" type="primary" round @click="loadNotifications">
                加载更多
            </NButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notification, Organization } from '../../interface/typ'
import { apiNotificationList } from '../../interface/notification'
import { NAvatar, NBlockquote, NButton, NEllipsis, NH2, NIcon, NText, NThing, NTime, useLoadingBar, useMessage } from 'naive-ui'
import { PieChartOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const loadingBar = useLoadingBar()

const oid = parseInt(route.params.oid as string)
const isManager = ref(route.query.is_manager === 'true')
onMounted(() => {
    if (!oid) {
        router.back()
    }
    loadNotifications()
})

const page = ref(0)

const notifications = ref<Notification[]>([])
const organization = ref<Organization>()

const loadNotifications = async () => {
    loadingBar.start()
    page.value += 1
    const response = await apiNotificationList(oid, page.value)
    loadingBar.finish()
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    notifications.value = notifications.value.concat(response.data?.notifications || [])
    organization.value = response.data?.organization
}

const toStatistics = (nid: number) => {
    router.push(`/notification/statistics/${nid}`)
}

const toOrganization = () => {
    router.push(`/organization/detail/${oid}`)
}

</script>

<style scoped>
.b-v-notification-organization {

}
</style>