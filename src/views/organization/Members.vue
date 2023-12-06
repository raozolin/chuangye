<template>
    <div class="b-v-organization-member">
        <NStatistic class="px4 pb4" label="选择想要管理的组织，您可以加载所有子级组织" :value="options.length">
            <template #prefix>总</template>
            <template #suffix>个子级组织</template>
        </NStatistic>
        <NButton type="primary" class="px4 w100 mb5" size="small" @click="toSubOrganizationMembers(oid, oid)">选择{{ organization?.name }}</NButton>
        <NDivider style="margin: 2px; font-size: small;" title-placement="left">子级组织</NDivider>
        <NTree class="w100" show-line block-line :data="options" :selectable="false"
            :allow-checking-not-loaded="true" :on-load="handleLoad" :expanded-keys="expandedKeys"
            :checked-keys="checkedKeys" @update:expanded-keys="handleExpandedKeysChange"
            @update:checked-keys="handleCheckedKeysChange" expand-on-click check-strategy="all"></NTree>
    </div>
</template>

<script setup lang="ts">
import { PeopleCircleOutline, PersonCircleOutline, TrashBinOutline } from '@vicons/ionicons5'
import { NDivider, NIcon, NTree, TreeOption, useMessage, NButton, NStatistic } from 'naive-ui'
import { h, onMounted, ref } from 'vue'
import { Organization, OrganizationMember, User } from '../../interface/typ'
import { apiOrganizationListArchtecture } from '../../interface/organization'
import { useRoute, useRouter } from 'vue-router'

const message = useMessage()
const router = useRouter()
const route = useRoute()

const organizationIcon = () => h(NIcon, { color: 'green' }, { default: () => h(PeopleCircleOutline) })
const peopleIcon = () => h(NIcon, { color: 'lightblue' }, { default: () => h(PersonCircleOutline) })

const oid = ref(0)
onMounted(() => {
    const id = parseInt(route.params.oid as string)
    if (id) {
        oid.value = id
        init()
    } else {
        message.error('组织ID错误')
        router.back()
    }
})

const organization = ref<Organization>()
const options = ref<TreeOption[]>([])
const expandedKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const handleExpandedKeysChange = (_expandedKeys: string[]) => {
    expandedKeys.value = _expandedKeys
}
const handleCheckedKeysChange = (_checkedKeys: string[]) => {
    checkedKeys.value = _checkedKeys
}
const loadArchitecture = (oid: number, page: number) => new Promise<{
    organization: Organization,
    members: OrganizationMember[],
    children: Organization[],
    success: boolean
}>(async resolve => {
    const response = await apiOrganizationListArchtecture(oid, page)
    if (!response.isSuccess()) {
        message.error(response.getError())
        resolve({
            organization: {} as Organization,
            members: [],
            children: [],
            success: false
        })
        return
    } else {
        resolve({
            organization: response.data?.organization || {} as Organization,
            members: response.data?.members || [],
            children: response.data?.children || [],
            success: true
        })
    }
})
const handleLoad = (node: TreeOption) => new Promise<void>(async (resolve) => {
    const response = await loadArchitecture(node.oid as number, 1)
    if (!response.success) {
        resolve()
        return
    }
    const children = response.children
    const treeLeaves: TreeOption[] = []
    children.forEach((item) => {
        const child = {
            key: 'o-' + item.id,
            label: item.name,
            prefix: organizationIcon,
            isLeaf: false,
            oid: item.id,
            suffix: () => h(NButton, { type: 'primary', size: 'small', onClick: () => {
                toSubOrganizationMembers(oid.value, item.id)
            }}, '选择')
        }
        treeLeaves.push(child)
    })
    node.children = treeLeaves
    resolve()
})
const init = async () => {
    const response = await loadArchitecture(oid.value, 1)
    if (!response.success) {
        return
    }
    organization.value = response.organization
    const children = response.children
    children.forEach((item) => {
        const child = {
            key: 'o-' + item.id,
            label: item.name,
            prefix: organizationIcon,
            oid: item.id,
            isLeaf: false,
            suffix: () => h(NButton, { type: 'primary', size: 'small', onClick: () => {
                toSubOrganizationMembers(oid.value, item.id)
            } }, '选择')
        }
        options.value.push(child)
    })
}

const toSubOrganizationMembers = (oid: number, sub_oid: number) => {
    router.push(`/organization/sub/${oid}/${sub_oid}`)
}

</script>

<style>
.b-v-organization-member {
    padding: 12px;
    background-color: white;
}

.n-tree-node {
    width: 100%;
    height: 34px;
}

.n-tree-node-content {
    font-size: 16px;
}

.n-tree .n-tree-node-switcher {
    padding-top: 4px;
}

.n-tree .n-tree-node-checkbox {
    padding-top: 4px;
}
</style>