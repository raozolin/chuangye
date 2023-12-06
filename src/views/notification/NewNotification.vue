<template>
    <div class="b-v-nofiticaion-new">
        <NCard size="small">
            <NH4 prefix="bar">
                <NText type="primary">发布</NText>
            </NH4>
            <NSteps size="small" :current="currentPage" style="padding: 4px; overflow-x: scroll;"
                @update-current="currentPage = $event">
                <NStep title="通知" description="" />
                <NStep title="事项" description="" />
                <NStep title="对象" description="" />
                <NStep title="确认" description="" />
            </NSteps>
        </NCard>
        <NCard size="small">
            <template v-if="currentPage === 1">
                <NH6 prefix="bar">
                    <NText type="primary" class="text-14">
                        用简短的文字描述通知的内容
                    </NText>
                    <NInput v-model:value="notificationForm.title" placeholder="XX学术会议" :maxlength="128" show-count />
                </NH6>
                <NH6 prefix="bar">
                    <NText type="primary" class="text-14">
                        通知完整文本
                    </NText>
                    <NInput type="textarea" v-model:value="notificationForm.body" placeholder="啥时候去哪几点开始" :maxlength="512"
                        show-count />
                    <NButton class="mt2 w100" type="primary" size="small" @click="extractNotificationBody">自动填充开始/结束时间</NButton>
                </NH6>
                <NH6 prefix="bar">
                    <NSpace justify="space-between">
                        <NButton text type="primary">
                            <NH6>
                                <NText type="primary" class="text-14">
                                    开始/结束时间
                                </NText>
                            </NH6>
                        </NButton>
                        <NTooltip trigger="click" style="max-width: 80vw;">
                            <template #trigger>
                                <NButton type="primary" text class="mr3">
                                    <template #icon>
                                        <NIcon :size="24" :component="HelpCircleOutline"></NIcon>
                                    </template> 帮助
                                </NButton>
                            </template>
                            开始与结束时间主要关联到这条消息的有效期，你可以通过上方的自动填充开始/结束时间按钮来自动填写
                        </NTooltip>
                    </NSpace>
                    <NDatePicker v-model:value="notificationForm.startAt" placeholder="开始时间" type="datetime"></NDatePicker>
                    <NDatePicker v-model:value="notificationForm.endAt" placeholder="结束时间" type="datetime"></NDatePicker>
                </NH6>
                <NCollapse class="mb5">
                    <NCollapseItem title="高级设置">
                        <template #header-extra>
                            <NTag size="small" v-if="notificationForm.priority == 1">不急</NTag>
                            <NTag size="small" v-else-if="notificationForm.priority == 3" type="success">一般</NTag>
                            <NTag size="small" v-else-if="notificationForm.priority == 5" type="warning">有点急</NTag>
                            <NTag size="small" v-else-if="notificationForm.priority == 7" type="error">紧急</NTag>
                            <NTag size="small" v-else-if="notificationForm.priority == 9" type="error">加急</NTag>
                            <NTag size="small" v-if="notificationForm.isPublic" type="success">公开</NTag>
                            <NTag size="small" v-if="notificationForm.autoRepublish" type="success">智能推送</NTag>
                        </template>
                        <NH6 prefix="bar">
                            <NSpace justify="space-between">
                                <NButton text type="primary">
                                    <NH6>
                                        <NText type="primary" class="text-14">
                                            消息优先级
                                        </NText>
                                    </NH6>
                                </NButton>
                                <NTooltip trigger="click" style="max-width: 80vw;">
                                    <template #trigger>
                                        <NButton type="primary" text class="mr3">
                                            <template #icon>
                                                <NIcon :size="24" :component="HelpCircleOutline"></NIcon>
                                            </template> 帮助
                                        </NButton>
                                    </template>
                                    优先级越高，消息越容易被用户看到，但是，如果较高优先级的消息被过多反馈为垃圾消息，那么该消息的优先级将会被降低，且该组织今后发布的消息优先级也会被降低，并且，发布后优先级不可修改
                                </NTooltip>
                            </NSpace>
                            <NRadioGroup v-model:value="notificationForm.priority">
                                <NRadio :value="1" label="不急"></NRadio>
                                <NRadio :value="3" label="一般"></NRadio>
                                <NRadio :value="5" label="有点急"></NRadio>
                                <NRadio :value="7" label="紧急"></NRadio>
                                <NRadio :value="9" label="加急"></NRadio>
                            </NRadioGroup>
                        </NH6>
                        <NH6 prefix="bar">
                            <NSpace justify="space-between">
                                <NButton text type="primary">
                                    <NH6>
                                        <NText type="primary" class="text-14">
                                            是否公开
                                        </NText>
                                    </NH6>
                                </NButton>
                                <NTooltip trigger="click" style="max-width: 80vw;">
                                    <template #trigger>
                                        <NButton type="primary" text class="mr3">
                                            <template #icon>
                                                <NIcon :size="24" :component="HelpCircleOutline"></NIcon>
                                            </template> 帮助
                                        </NButton>
                                    </template>
                                    如果公开，组织外部的用户也可以看到该消息，否则，只有组织内部的用户可以看到该消息
                                </NTooltip>
                            </NSpace>
                            <NSwitch v-model:value="notificationForm.isPublic"></NSwitch>
                        </NH6>
                        <NH6 prefix="bar">
                            <NSpace justify="space-between">
                                <NButton text type="primary">
                                    <NH6>
                                        <NText type="primary" class="text-14">
                                            自动推送给之后加入的新成员
                                        </NText>
                                    </NH6>
                                </NButton>
                                <NTooltip trigger="click" style="max-width: 80vw;">
                                    <template #trigger>
                                        <NButton type="primary" text class="mr3">
                                            <template #icon>
                                                <NIcon :size="24" :component="HelpCircleOutline"></NIcon>
                                            </template> 帮助
                                        </NButton>
                                    </template>
                                    当有新成员加入组织时，如果该消息仍在有效期内，那么该消息将会被自动推送给新成员
                                </NTooltip>
                            </NSpace>
                            <NSwitch v-model:value="notificationForm.autoRepublish"></NSwitch>
                        </NH6>
                    </NCollapseItem>
                </NCollapse>
            </template>
            <template v-else-if="currentPage == 2">
                <NH6 prefix="bar">
                    <NSpace justify="space-between">
                        <NButton text type="primary">
                            <NH6>
                                <NText type="primary" class="text-14">
                                    事项（任务）
                                </NText>
                            </NH6>
                        </NButton>
                        <NTooltip trigger="click" style="max-width: 80vw;">
                            <template #trigger>
                                <NButton type="primary" text class="mr3">
                                    <template #icon>
                                        <NIcon :size="24" :component="HelpCircleOutline"></NIcon> 
                                    </template>
                                    帮助
                                </NButton>
                            </template>
                            一条消息中可以携带多个事项（任务），如：<br>
                            事项一：明天3点去参加在大教堂的学术讲座 <br>
                            事项二：完成学术报告 
                            <br>
                            <br>
                            您可以直接使用“保存通知为事项”按钮，将通知中的内容自动转换为事项
                        </NTooltip>
                    </NSpace>
                    <NButtonGroup>
                        <NButton @click="createTask" type="primary" size="small">新建一条事项</NButton>
                        <NButton @click="createTaskByNotification" type="info" size="small">保存通知为事项</NButton>
                    </NButtonGroup>
                    <NCard :bordered="false" size="small" class="mt3" v-for="(task, k) in notificationForm.tasks">
                        <NText type="primary">标题</NText>
                        <NInput class="mb1 mt1" placeholder="" v-model:value="task.title" size="small">
                            <template #suffix>
                                <NButton text @click="deleteTask(k)" type="error" size="small">删除</NButton>
                            </template>
                        </NInput>
                        <NText type="primary">内容</NText>
                        <NInput class="mt1" placeholder="" type="textarea" v-model:value="task.body" size="small"></NInput>
                        <NText type="primary">开始/结束时间</NText>
                        <NDatePicker class="mb1 mt1" v-model:value="task.startAt" placeholder="开始时间" type="datetime"
                            size="small"></NDatePicker>
                        <NDatePicker class="mt1" v-model:value="task.endAt" placeholder="结束时间" type="datetime"
                            size="small"></NDatePicker>
                    </NCard>
                </NH6>
            </template>
            <!-- to avoid reload, use v-show instead of v-if -->
            <div v-show="currentPage === 3">
                <NSpace justify="space-between">
                    <NH6 class="text-15">
                        <NText type="primary" class="text-14">
                            选择发布到哪个组织
                        </NText>
                    </NH6>
                    <NTooltip trigger="click" style="max-width: 80vw;">
                        <template #trigger>
                            <NButton type="primary" text class="mr3 right" size="small">
                                <template #icon>
                                    <NIcon :size="24" :component="HelpCircleOutline"></NIcon>
                                </template>
                                帮助
                            </NButton>
                        </template>
                        您需要首先选择一个组织，然后再选择要发布给组织内的哪些成员 <br>
                        1. 可以选择组织内的子组织 <br>
                        2. 也可以选择组织内的成员 <br>
                        3. 也可以同时选择多个组织和成员 <br>
                        4. 空选则发布到组织内的所有成员
                    </NTooltip>
                </NSpace>
                <NSelect class="my3" v-model:value="notificationForm.organizationId" :options="ogranizationOptions" />
                <OrganizationMembers class="mb5" v-if="notificationForm.organizationId" :oid="notificationForm.organizationId"
                    v-model:value="notificationForm.selectedTarget"></OrganizationMembers>
                <NEmpty class="mb5" v-else description="请先选择组织"></NEmpty>
            </div>
            <template v-if="currentPage == 4">
                <NResult class="my5" status="info" title="发布消息"
                    :description="`发布1条通知，${notificationForm.tasks.length}个任务到组织 
                                                    ${ogranizationOptions.find((item) => item.value == notificationForm.organizationId)?.label || ''}`" v-if="!isSending"></NResult>
                <NSpin class="center w100 my5" v-if="isSending" :size="90">
                    <template #description>
                        发布中
                    </template>
                </NSpin>
                <NButton type="primary" class="w100 my5" size="small" :disabled="isSending" @click="send">
                    发布
                </NButton>
            </template>
        </NCard>
        <NCard size="small" :bordered="false">
            <NButtonGroup class="w100">
                <NButton :style="{
                    'width': currentPage == 4 ? '100%' : '50%',
                }" v-if="currentPage != 1" @click="prevStep" type="error" size="small" :disabled="isSending">上一步</NButton>
                <NButton :style="{
                    'width': currentPage == 1 ? '100%' : '50%',
                }" v-if="currentPage != 4" @click="nextStep" type="primary" size="small">下一步</NButton>
            </NButtonGroup>
        </NCard>
    </div>
</template>

<script setup lang="ts">
import { HelpCircleOutline } from '@vicons/ionicons5'
import {
    NButton, NButtonGroup, NCard, NCollapse, NCollapseItem, NDatePicker,
    NDivider, NEmpty, NH4, NH6, NIcon, NInput, NRadio, NRadioGroup,
    NResult, NSelect, NSpace, NSpin, NStep, NSteps, NSwitch, NTag, NText, NTooltip, useMessage
} from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { apiNotificationExtractBody, apiNotificationPublish } from '../../interface/notification'
import { apiOrganizationListUserManage } from '../../interface/organization'
import OrganizationMembers from '../../component/OrganizationMembers.vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const message = useMessage()
const router = useRouter()

const getRoundedTime = (after?: Duration) => {
    var currentDate = new Date()
    var currentMinutes = currentDate.getMinutes()

    var roundedMinutes = Math.floor(currentMinutes / 10) * 10

    currentDate.setMinutes(roundedMinutes)

    if (after?.hours) {
        after.minutes = after.hours * 60 + (after.minutes || 0)
    }
    if (after?.days) {
        after.minutes = after.days * 24 * 60 + (after.minutes || 0)
    }
    if (after?.weeks) {
        after.minutes = after.weeks * 7 * 24 * 60 + (after.minutes || 0)
    }

    currentDate.setSeconds(0)

    if (after && after.minutes) {
        currentDate.setMinutes(currentDate.getMinutes() + after.minutes)
    }

    return currentDate
}

const currentPage = ref(1)
const nextStep = () => {
    currentPage.value += 1
}
const prevStep = () => {
    currentPage.value -= 1
}

type Task = {
    title: string
    body: string
    startAt: number
    endAt: number
}

const notificationForm = ref({
    title: '',
    body: '',
    isPublic: false,
    autoRepublish: true, // push to new members
    organizationId: 0,
    startAt: getRoundedTime().getTime(),
    endAt: getRoundedTime({ hours: 24 }).getTime(),
    priority: 3,
    tasks: [] as Task[],
    selectedTarget: [] as string[] // selected in OrganizationMembers
})

const createTask = () => {
    notificationForm.value.tasks.push({
        title: '',
        body: '',
        startAt: getRoundedTime().getTime(),
        endAt: getRoundedTime({ hours: 24 }).getTime()
    })
}

const createTaskByNotification = () => {
    notificationForm.value.tasks.push({
        title: notificationForm.value.title,
        body: notificationForm.value.body,
        startAt: notificationForm.value.startAt,
        endAt: notificationForm.value.endAt
    })
}

const deleteTask = (index: number) => {
    notificationForm.value.tasks.splice(index, 1)
}

const extractNotificationBody = async () => {
    if (notificationForm.value.body.length <= 2) {
        message.info('请输入完整的通知内容')
        return
    }

    const response = await apiNotificationExtractBody(notificationForm.value.body)
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    if (response.data?.time_extract.start) {
        notificationForm.value.startAt = new Date(response.data.time_extract.start).getTime()
        message.info(`解析到开始时间：${new Date(notificationForm.value.startAt).toLocaleString()}`)
    }
    if (response.data?.time_extract.end) {
        notificationForm.value.endAt = new Date(response.data.time_extract.end).getTime()
        message.info(`解析到结束时间：${new Date(notificationForm.value.endAt).toLocaleString()}`)
    }
}

const organizations = ref([] as any[])

const ogranizationOptions = computed(() => {
    return organizations.value.map((item) => {
        return {
            label: item.name,
            value: item.id
        }
    })
})

const loadOrganizationList = async () => {
    const response = await apiOrganizationListUserManage()
    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        organizations.value = response.data?.organizations || []
    }
}

// saving draft marks whether the draft should be saved
const savingDraft = ref(true)

const saveDraft = () => {
    localStorage.setItem('notification-draft', JSON.stringify(notificationForm.value))
}

const loadDraft = () => {
    const draft = localStorage.getItem('notification-draft')
    if (draft) {
        notificationForm.value = JSON.parse(draft)
    }
}

const clearDraft = () => {
    localStorage.removeItem('notification-draft')
}

onMounted(() => {
    loadOrganizationList()
    loadDraft()
})

onBeforeUnmount(() => {
    if (savingDraft.value) {
        saveDraft()
    }
})

const isSending = ref(false)

const send = async () => {
    const organizations = [] as number[]
    const users = [] as number[]
    notificationForm.value.selectedTarget.forEach((item) => {
        if (item.startsWith('o-')) {
            organizations.push(parseInt(item.substring(2)))
        } else if (item.startsWith('u-')) {
            users.push(parseInt(item.substring(2)))
        }
    })

    if (!notificationForm.value.organizationId) {
        message.error('请选择组织')
        return
    }

    isSending.value = true

    const response = await apiNotificationPublish(
        notificationForm.value.title,
        notificationForm.value.body,
        notificationForm.value.isPublic,
        notificationForm.value.autoRepublish,
        notificationForm.value.organizationId,
        organizations,
        users,
        notificationForm.value.startAt,
        notificationForm.value.endAt,
        notificationForm.value.priority,
        JSON.stringify(notificationForm.value.tasks)
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        message.success('发布成功，推送到全部成员可能需要1~5分钟')
        savingDraft.value = false
        clearDraft()
        router.push('/notification')
    }

    isSending.value = false
}

</script>

<style scoped>
.b-v-nofiticaion-new {
    min-height: 100%;
    background-color: white;
}
</style>