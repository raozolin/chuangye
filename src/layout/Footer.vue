<template>
    <div class="m-l-footer" v-if="UserOnline">
        <NGrid cols="5">
            <NGi class="text-center" style="margin-top: 4px;">
                <div @click="switchToNotification">
                    <NBadge :value="unconfirmed" :max="99" style="margin-top: 4px;" :offset="[0, 4]">
                        <NIcon v-if="route.name == 'Notification'" color="green" :component="Notifications" :size="24"></NIcon>
                        <NIcon v-else color="grey" :component="NotificationsOutline" :size="24"></NIcon>
                    </NBadge>
                    <div style="font-size: 10px;">
                        通知
                    </div>
                </div>
            </NGi>
            <NGi class="text-center" style="margin-top: 4px;">
                <div @click="switchToTask">
                    <NBadge :value="undone" :max="99" style="margin-top: 4px;" :offset="[0, 4]">
                        <NIcon v-if="route.name == 'Task'" color="green" :component="List" :size="24"></NIcon>
                        <NIcon v-else color="grey" :component="ListOutline" :size="24"></NIcon>
                    </NBadge>
                    <div style="font-size: 10px;">
                        事项
                    </div>
                </div>
            </NGi>
            <NGi class="text-center" style="margin-top: 4px;">
                <div @click="bottomDrawer = true">
                    <NBadge :max="99" style="margin-top: 4px;" :offset="[0, 4]">
                        <NIcon v-if="route.name == 'NewNoticiation'" color="green" :component="PaperPlane" :size="24"></NIcon>
                        <NIcon v-else color="grey" :component="PaperPlaneOutline" :size="24"></NIcon>
                    </NBadge>
                    <div style="font-size: 10px;">
                        发布
                    </div>
                </div>
            </NGi>
            <NGi class="text-center" style="margin-top: 4px;">
                <div @click="switchToOrganization">
                    <NBadge :value="0" :max="99" style="margin-top: 4px;" :offset="[0, 4]">
                        <NIcon v-if="route.name == 'OrganizationList'" color="green" :component="People" :size="24"></NIcon>
                        <NIcon v-else color="grey" :component="PeopleOutline" :size="24"></NIcon>
                    </NBadge>
                    <div style="font-size: 10px;">
                        组织
                    </div>
                </div>
            </NGi>
            <NGi class="text-center" style="margin-top: 4px;">
                <div @click="toHome">
                    <NBadge :max="99" style="margin-top: 4px;" :offset="[0, 4]">
                        <NIcon v-if="route.name == 'Home'" color="green" :component="Man" :size="24"></NIcon>
                        <NIcon v-else color="grey" :component="ManOutline" :size="24"></NIcon>
                    </NBadge>
                    <div style="font-size: 10px;">
                        我的
                    </div>
                </div>
            </NGi>
        </NGrid>
        <NDrawer v-model:show="bottomDrawer" placement="bottom">
            <NDrawerContent title="通知发布">
                <NGrid cols="3 s:3 m:4 l:4 xl:5 2xl:5" responsive="screen" y-gap="12">
                    <NGi class="text-center" @click="toNewNotification">
                        <div>
                            <NIcon color="green" :component="NotificationsOutline" :size="30"></NIcon>
                        </div>
                        <div>
                            普通通知
                        </div>
                    </NGi>
                    <!-- <NGi class="text-center">
                        <div>
                            <NIcon color="green" :component="CreateOutline" :size="30"></NIcon>
                        </div>
                        <div>
                            收集表
                        </div>
                    </NGi> -->
                    <NGi class="text-center" @click="toPublished">
                        <div>
                            <NIcon color="green" :component="ListOutline" :size="30"></NIcon>
                        </div>
                        <div>
                            查看已发布
                        </div>
                    </NGi>
                </NGrid>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<script setup lang="ts">
import { CaretUpCircleOutline, CreateOutline, List, ListOutline, MailOpenOutline, Man, ManOutline, Notifications, NotificationsOutline, PaperPlane, PaperPlaneOutline, People, PeopleOutline, Send, SendOutline } from '@vicons/ionicons5'
import { NBadge, NButton, NDrawer, NDrawerContent, NGi, NGrid, NIcon, NIconWrapper, NList, NListItem, NPopover } from 'naive-ui'
import { StyleValue, computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStatistics } from '../store/notification'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()

const { UserOnline } = storeToRefs(useUserStore())

const switchToNotification = () => {
    router.push('/notification')
}

const switchToTask = () => {
    router.push('/task')
}

const switchToOrganization = () => {
    router.push('/organization_list')
}

const toNewNotification = () => {
    bottomDrawer.value = false
    router.push('/notification/new')
}

const toHome = () => {
    router.push('/home')
}

const toPublished = () => {
    bottomDrawer.value = false
    router.push('/notification/published/user')
}

const { unconfirmed, undone } = useNotificationStatistics()

const bottomDrawer = ref(false)

</script>

<style scoped>
.m-l-footer {
    text-align: center;
    background-color: white;
    position: relative;
    box-shadow: rgba(17, 17, 26, 0.1) 0px 0px 16px;
}

.m-l-footer-border {
    transition: all .3s;
}

.m-l-footer-hidden {
    display: none;
}

.m-l-footer-active {
    color: #4b9e5f;
}

</style>