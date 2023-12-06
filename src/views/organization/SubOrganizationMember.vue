<template>
    <div class="b-v-organization-sub">
        <NStatistic label="组织成员列表，点击成员进行管理" class="mb3" :value="total">
            <template #prefix>共</template>
            <template #suffix>名成员</template>
        </NStatistic>
        <NInputGroup>
            <NInput v-model:value="name" class="mb5" placeholder="请输入成员名称尽进行搜索"></NInput>
            <NButton type="primary" @click="search">搜索</NButton>
        </NInputGroup>
        <NThing v-for="(member, k) in members" content-indented class="mb1" @click="openMember(k)">
            <template #avatar>
                <NAvatar round :size="64" :src="member.user.profile.avatar"></NAvatar>
            </template>
            <template #header>
                {{ member.name }}
            </template>
            <template #header-extra>
                <NTime :time="new Date(member.created_at || 0)" :to="new Date()" type="relative"></NTime>加入
            </template>
            <NTag :type="member.is_manager ? 'error' : 'primary'" size="small" :bordered="false">{{ member.role }}</NTag>
        </NThing>
        <NButton type="primary" class="w100 mt5" @click="loadMore">
            <template #icon>
                <NIcon :component="Refresh"></NIcon>
            </template>
            加载更多
        </NButton>
        <NDrawer v-model:show="showCurrentMember" placement="bottom" :height="600">
            <NDrawerContent :title="'管理成员 ' + currentMember?.name" closable>
                <NForm>
                    <NFormItem label="成员名称">
                        <NInputGroup>
                            <NInputGroupLabel>名称</NInputGroupLabel>
                            <NInput v-model:value="members[currentMemberIndex].name"></NInput>
                        </NInputGroup>
                    </NFormItem>
                    <NFormItem label="头衔，可以是职位、职称或岗位名称等">
                        <NInputGroup>
                            <NInputGroupLabel>头衔</NInputGroupLabel>
                            <NInput v-model:value="members[currentMemberIndex].role"></NInput>
                        </NInputGroup>
                    </NFormItem>
                    <NFormItem label="设为管理员">
                        <NSwitch v-model:value="members[currentMemberIndex].is_manager"></NSwitch>
                    </NFormItem>
                    <NFormItem label="确认修改">
                        <NButton type="primary" class="w100" @click="updateMember">确定</NButton>
                    </NFormItem>
                </NForm>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<script setup lang="ts">
import { NAvatar, NButton, NDialog, NDrawer, NDrawerContent, NForm, NFormItem, NIcon, NInput, NInputGroup, NInputGroupLabel, NStatistic, NSwitch, NTag, NThing, NTime, useMessage } from 'naive-ui'
import { apiOrganizationListMembers, apiOrganizationUpdateMember } from '../../interface/organization'
import { computed, onMounted, ref } from 'vue'
import { OrganizationMember } from '../../interface/typ'
import { useRoute, useRouter } from 'vue-router'
import { Refresh } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const oid = ref(parseInt(route.params.oid as string))
const sub_oid = ref(parseInt(route.params.sub_oid as string))

const showCurrentMember = ref(false)
const currentMemberIndex = ref(-1)
const currentMember = computed(() => {
    if (currentMemberIndex.value < 0) {
        return null
    }
    return members.value[currentMemberIndex.value]
})
const openMember = (index: number) => {
    currentMemberIndex.value = index
    showCurrentMember.value = true
}

const total = ref(0)
const page = ref(1)
const name = ref('')
const members = ref<OrganizationMember[]>([])

const loadMembers = async (restart: boolean = false) => {
    const response = await apiOrganizationListMembers(oid.value, page.value, sub_oid.value, name.value)
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    total.value = response.data?.total || 0
    if (restart) {
        members.value = []
    }
    members.value.push(...(response.data?.members || []))
}

const updateMember = async () => {
    const response = await apiOrganizationUpdateMember(
        oid.value,
        members.value[currentMemberIndex.value].user_id,
        members.value[currentMemberIndex.value].role,
        members.value[currentMemberIndex.value].name,
        members.value[currentMemberIndex.value].is_manager,
    )
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    message.success('修改成功')
    showCurrentMember.value = false
    loadMembers(true)
}

const search = () => {
    page.value = 1
    loadMembers(true)
}

const loadMore = () => {
    page.value += 1
    loadMembers()
}

onMounted(() => {
    if (!oid.value || !sub_oid.value) {
        router.back()
        return
    }

    loadMembers()
})

</script>

<style scoped>
.b-v-organization-sub {
    background-color: white;
    min-height: 90vh;
    padding: 12px;
}
</style>