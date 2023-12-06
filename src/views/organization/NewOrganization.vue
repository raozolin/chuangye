<template>
    <div class="b-v-organization-new">
        <NH2 prefix="bar">
            <NText type="primary">创建组织</NText>
        </NH2>
        <NDivider></NDivider>
        <NForm v-model:form="organizationForm" label-width="auto">
            <NFormItem label="组织名称" path="name">
                <NH6 prefix="bar" class="w100">
                    <div class="text-13 w100">
                        组织名称可以重复，但请尽可能保持唯一性
                    </div>
                    <NInput v-model:value="organizationForm.name" maxlength="64" show-count />
                </NH6>
            </NFormItem>
            <NFormItem label="组织描述" path="description">
                <NH6 prefix="bar" class="w100">
                    <div class="text-13 w100">
                        用简短的文字描述组织的基本信息
                    </div>
                    <NInput type="textarea" v-model:value="organizationForm.description" maxlength="512" show-count />
                </NH6>
            </NFormItem>
            <NFormItem label="组织类型" path="description">
                <NH6 prefix="bar" class="w100">
                    <div class="text-13 w100">
                        选择组织的类型
                    </div>
                    <NSelect type="textarea" :options="typeOptions" v-model:value="organizationForm.type" maxlength="512" show-count />
                </NH6>
            </NFormItem>
            <NFormItem label="上级组织" path="parentName">
                <NH6 prefix="bar" class="w100">
                    <div class="text-13 w100">
                        该组织是否属于其他组织
                    </div>
                    <NSelect v-model:value="organizationForm.parentID" :options="ogranizationOptions" />
                </NH6>
            </NFormItem>
            <NFormItem label="位置">
                <NH6 prefix="bar" class="w100">
                    <div class="text-13 w100">
                        组织地理位置：{{ organizationForm.coordinate.lng.toFixed(4) }} / {{ organizationForm.coordinate.lat.toFixed(4) }}
                    </div>
                    <div style="width: 100%; height: 20vh;">
                        <BMap enable-search search-on-edit v-model:point="organizationForm.coordinate"></BMap>
                    </div>
                </NH6>
            </NFormItem>
            <NFormItem label=" ">
                <NButton type="primary" class="w100" @click="createOrganization">提交</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>

<script setup lang="ts">
import { NButton, NDivider, NForm, NFormItem, NH2, NH6, NInput, NSelect, NText, useLoadingBar, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { apiOrganizationCreate, apiOrganizationListUserManage } from '../../interface/organization'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import BMap from '../../component/BMap.vue'
import { getOrganizationTypeSheet } from '../../utils/organization_types'

const message = useMessage()
const router = useRouter()
const loadingBar = useLoadingBar()

const userStore = useUserStore()

const typeOptions = ref(getOrganizationTypeSheet().map(v => ({
    label: v.name,
    value: v.code,
})))

const organizations = ref([] as any[])

const ogranizationOptions = computed(() => {
    return organizations.value.map((item) => {
        return {
            label: item.name,
            value: item.id
        }
    })
})

const organizationForm = ref({
    name: '',
    description: '',
    coordinate: {
        lng: 0,
        lat: 0
    },
    parentID: 0,
    type: 'ngo',
})

const createOrganization = async () => {
    if (organizationForm.value.name.length === 0) {
        message.error('组织名称不能为空')
        return
    } else if (organizationForm.value.description.length === 0) {
        message.error('组织描述不能为空')
        return
    }

    loadingBar.start()
    const response = await apiOrganizationCreate(
        organizationForm.value.name,
        organizationForm.value.description,
        organizationForm.value.parentID,
        organizationForm.value.coordinate.lng,
        organizationForm.value.coordinate.lat,
        organizationForm.value.type
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        message.success('创建成功')
        userStore.refresh()
        router.back()
    }
    loadingBar.finish()
}

const loadOrganizationList = async () => {
    const response = await apiOrganizationListUserManage()
    if (!response.isSuccess()) {
        message.error(response.getError())
    } else {
        organizations.value = response.data?.organizations || []
    }
}

onMounted(() => {
    loadOrganizationList()
})

</script>

<style scoped>
.b-v-organization-new {
    padding: 12px;
    border-radius: 12px;
    background-color: white;
}
</style>