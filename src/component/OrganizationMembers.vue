<template>
    <div class="b-c-organization-member px1 py5">
        <NTree class="w100" show-line block-line checkable :data="options" :selectable="false"
            :allow-checking-not-loaded="true" :on-load="handleLoad" :expanded-keys="expandedKeys"
            :checked-keys="checkedKeys" @update:expanded-keys="handleExpandedKeysChange"
            @update:checked-keys="handleCheckedKeysChange" expand-on-click check-strategy="all"></NTree>
    </div>
</template>

<script setup lang="ts">
import { PeopleCircleOutline, PersonCircleOutline, TrashBinOutline } from '@vicons/ionicons5'
import { NIcon, NTree, TreeOption, useMessage, NButton } from 'naive-ui'
import { h, ref, watch } from 'vue'
import { Organization, OrganizationMember, User } from '../interface/typ'
import { apiOrganizationListArchtecture } from '../interface/organization'

const message = useMessage()

const organizationIcon = () => h(NIcon, { color: 'green' }, { default: () => h(PeopleCircleOutline) })
const peopleIcon = () => h(NIcon, { color: 'lightblue' }, { default: () => h(PersonCircleOutline) })

const oid = defineProps({
    oid: {
        type: Number,
        required: true
    }
})

let timer = 0
watch(() => oid.oid, () => {
    // avoid too many requests
    if (timer === 0) {
        setTimeout(() => init(), 0)
        return
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
        init()
        timer = 0
    }, 1000) as any
}, { immediate: true })

const options = ref<TreeOption[]>([])
const expandedKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const handleExpandedKeysChange = (_expandedKeys: string[]) => {
    expandedKeys.value = _expandedKeys
}
const handleCheckedKeysChange = (_checkedKeys: string[]) => {
    checkedKeys.value = _checkedKeys
    model.value = _checkedKeys
}
const model = defineModel<string[]>('value', { local: true })
watch(model, (value) => {
    if (value === undefined) {
        return
    }
    checkedKeys.value = value
})
const loadArchitecture = (oid: number, page: number) => new Promise<{
    members: OrganizationMember[],
    children: Organization[],
    success: boolean
}>(async resolve => {
    const response = await apiOrganizationListArchtecture(oid, page)
    if (!response.isSuccess()) {
        message.error(response.getError())
        resolve({
            members: [],
            children: [],
            success: false
        })
        return
    } else {
        resolve({
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
    const members = response.members
    const children = response.children
    const treeLeaves: TreeOption[] = []
    children.forEach((item) => {
        const child = {
            key: 'o-' + item.id,
            label: item.name,
            prefix: organizationIcon,
            isLeaf: false,
            oid: item.id,
        }
        treeLeaves.push(child)
    })
    members.forEach((item) => {
        treeLeaves.push({
            key: 'u-' + item.user_id,
            label: item.name,
            prefix: peopleIcon,
            isLeaf: true,
        })
    })
    node.children = treeLeaves
    resolve()
})

const init = async () => {
    if (oid.oid === undefined || oid.oid === 0) {
        return
    }

    const response = await loadArchitecture(oid.oid, 1)
    if (!response.success) {
        return
    }

    options.value = []

    const members = response.members
    const children = response.children
    children.forEach((item) => {
        const child = {
            key: 'o-' + item.id,
            label: item.name,
            prefix: organizationIcon,
            oid: item.id,
            isLeaf: false,
        }
        options.value.push(child)
    })
    members.forEach((item) => {
        options.value.push({
            key: 'u-' + item.user_id,
            label: item.name,
            prefix: peopleIcon,
            isLeaf: true,
        })
    })
}

</script>

<style>
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