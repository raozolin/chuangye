<template>
    <div class="b-v-organization-invite">
        <NResult class="py5 px5" status="404" description="在该组织中您想被怎么称呼？比如在娱乐行业，可以填写为艺名。在政府机构，需要是真名。这取决于你加入的组织的要求。"></NResult>
        <div class="mx5">
            <NInput size="large" placeholder="请输入名称" v-model:value="name" maxlength="64" show-count></NInput>
            <NButton class="mt5" block type="primary" @click="join">确认</NButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NResult, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiOrganizationJoinInvite } from '../../interface/organization'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const inviteCode = ref(route.query.code as string)
const oid = ref(parseInt(route.params.oid as string))

const name = ref('')

const join = async () => {
    if (!inviteCode.value || !oid.value) {
        message.error('无效的邀请')
        return
    }

    if (!name.value) {
        message.error('请输入名称')
        return
    }

    const response = await apiOrganizationJoinInvite(inviteCode.value, oid.value, name.value)
    if(!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    message.success('加入成功')
    router.push('/home')
}

onMounted(() => {
    if (!inviteCode.value || !oid.value) {
        router.back()
        return
    }
})
</script>

<style scoped>
.b-v-organization-invite {
    width: 100%;
    min-height: 100%;
    background-color: white;
}
</style>