<template>
    <div class="b-v-organization-waiting-list">
        <NH2 prefix="bar">
            <NText type="primary">加入申请审批</NText>
        </NH2>
        <NSelect class="mb5" size="small"
            v-model:value="filter.status"
            placeholder="请选择状态"
            :options="filterOptions"
        ></NSelect>
        <NDataTable :pagination="pagination" @update:page="onPageChange" :bordered="false" :data="requests"
            :columns="columns" remote></NDataTable>
    </div>
</template>

<script setup lang="ts">
import { 
    NDataTable, NH2, NText, DataTableColumn, NButtonGroup, 
    NButton, useMessage, NTag, NSelect, useLoadingBar, NTime, NIcon 
} from 'naive-ui'
import {
    apiOrganizationListJoinRequest,
    apiOrganizationJoinRequestAccept,
    apiOrganizationJoinRequestReject
} from '../../interface/organization'
import { h, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { OrganizationJoinRequest } from '../../interface/typ'
import { CellularOutline, CheckmarkOutline, CloseCircleOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const loadingBar = useLoadingBar()

const pagination = reactive({
    pageSize: 20,
    pageCount: 1,
    page: 1,
    itemCount: 9999
})

const filter = ref({
    status: -1
})
const filterOptions = ref([
    {
        label: '全部',
        value: -1
    },
    {
        label: '未审批',
        value: 0
    },
    {
        label: '已同意',
        value: 1
    },
    {
        label: '已拒绝',
        value: 2
    }
])
watch(filter, () => {
    pagination.page = 1
    loadRequests()
}, { deep: true })

const oid = ref(0)
const unwatch = watch(() => route.params.oid, (newVal) => {
    setTimeout(() => {
        const id = parseInt(newVal as string)
        if (id) {
            oid.value = id
            loadRequests()
        } else {
            router.back()
        }
    })
}, { immediate: true })
onBeforeRouteLeave(() => {
    // unwatch
    unwatch()
})

const requests = ref<OrganizationJoinRequest[]>([])

const onPageChange = (page: number) => {
    pagination.page = page
    loadRequests()
}

const columns: DataTableColumn<OrganizationJoinRequest>[] = [
    {
        key: 'name',
        title: '申请人',
    },
    {
        key: 'created_at',
        title: '申请时间',
        render: (row) => h(NText, null, { 
            default: () => h(
                NTime, {
                    time: new Date(row.created_at),
                    to: new Date(),
                    type: 'relative'
                }
            )
        }),
    },
    {
        key: 'status',
        title: '状态',
        render: (row) => h(NIcon, {
            type: row.status === 0 ? 'warning' : (row.status === 1 ? 'primary' : 'error'),
            size: 24,
            component: row.status === 0 ? CellularOutline : row.status === 1 ? CheckmarkOutline : CloseCircleOutline
        })
    },
    {
        key: 'actions',
        title: '操作',
        render: (row) => h(NButtonGroup, {
            vertical: true
        }, {
            default: () => [
                h(NButton, {
                    type: 'primary',
                    size: 'small',
                    onClick: () => accept(row.id),
                    disabled: row.status !== 0
                }, {
                    default: () => '同意'
                }),
                h(NButton, {
                    type: 'error',
                    size: 'small',
                    onClick: () => reject(row.id),
                    disabled: row.status !== 0
                }, {
                    default: () => '拒绝'
                })
            ]
        })
    }
]

const loadRequests = async () => {
    loadingBar.start()
    const response = await apiOrganizationListJoinRequest(oid.value, filter.value.status, pagination.page)
    loadingBar.finish()
    if (!response.isSuccess()) {
        return
    }
    pagination.itemCount = response.data?.total || 0
    pagination.pageCount = Math.ceil(pagination.itemCount / pagination.pageSize)
    requests.value = response.data?.wait_list || []
}

const accept = async (id: number) => {
    const response = await apiOrganizationJoinRequestAccept(id)
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadRequests()
}

const reject = async (id: number) => {
    const response = await apiOrganizationJoinRequestReject(id)
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    loadRequests()
}

</script>

<style scoped>
.b-v-organization-waiting-list {
    min-height: 100%;
    position: relative;
    background-color: white;
    padding: 12px;
    border-radius: 12px;
}
</style>