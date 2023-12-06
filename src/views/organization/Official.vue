<template>
    <div class="b-v-organization-official px5 py3">
        <div class="header my3 container-default">
            <NThing content-indented class="mx5">
                <template #header>
                    <NText type="primary">
                        {{ organization?.name }}
                    </NText>
                </template>
                <template #description>
                    <NEllipsis style="max-width: 80vw" line-clamp="5">
                        {{ organization?.description }}
                    </NEllipsis>
                </template>
            </NThing>
        </div>
        <div class="container-default">
            <div v-if="organization?.is_official">
                <NEmpty description="该组织已经完成认证">
                    <template #icon>
                        <NIcon color="green" :component="CheckmarkCircleOutline"></NIcon>
                    </template>
                </NEmpty>
            </div>
            <div v-else class="px5">
                <NDivider title-placement="left">申请认证</NDivider>
                <NForm label-placement="left" label-width="auto">
                    <NFormItem label="联系方式">
                        <NInput placeholder="我们可以联系到您的方式" v-model:value="applyForm.concat" maxlength="64" show-count />
                    </NFormItem>
                    <NFormItem label="申请文本">
                        <NInput placeholder="一段证明您身份的文字" type="textarea" v-model:value="applyForm.content" maxlength="512" show-count />
                    </NFormItem>
                    <NFormItem label=" ">
                        <NButton type="primary" class="w100" @click="applyOfficial">提交</NButton>
                    </NFormItem>
                </NForm>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Organization } from '../../interface/typ'
import { onMounted, ref } from 'vue'
import { apiOrganizationInfo, apiOrganizationApplyOfficial } from '../../interface/organization'
import { NButton, NDivider, NEmpty, NForm, NFormItem, NIcon, NInput, NThing, useMessage } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const applyForm = ref({
    content: '',
    concat: ''
})
const organization = ref<Organization>()
const oid = parseInt(route.params.oid as string)
const loadOrganization = async () => {
    const response = await apiOrganizationInfo(oid)
    if (response.isSuccess()) {
        organization.value = response.data?.organization
    } else {
        router.back()
    }
}
onMounted(() => {
    if (oid) {
        loadOrganization()
    } else {
        router.back()
    }
}) 

const applyOfficial = async () => {
    if (!applyForm.value.concat) {
        message.error('联系方式不能为空')
        return
    }

    if (!applyForm.value.content) {
        message.error('申请文本不能为空')
        return
    }

    const response = await apiOrganizationApplyOfficial(oid, applyForm.value.concat, applyForm.value.content)
    if (response.isSuccess()) {
        message.success('申请已提交')
        router.back()
    } else {
        message.error(response.getError())
    }
}


</script>

<style scoped>

</style>