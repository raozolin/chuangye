<template>
    <div class="b-c-filter" :style="{
        height: props.height + 'px',
    }">
        <div>
            <NButton class="text-left" block text type="primary" @click="openFilter">
                <template #icon>
                    <NIcon :component="Filter"></NIcon>
                </template>
                分类
            </NButton>
        </div>
    </div>
    <div class="b-c-filter-tags" v-if="filterTags.length > 0"> 
        <NTag :bordered="false" round type="primary" size="small" v-for="(t, k) in filterTags" closable @close="handleCloseTag(k)">
            {{ t }}
        </NTag>
    </div>
    <NDrawer :height="300" v-model:show="showFilter" placement="bottom">
        <NDrawerContent title="按照分类进行筛选" closable>
            <NGrid cols="3 s:3 m:4 l:4 xl:5 2xl:5" responsive="screen" y-gap="12">
                <NGi class="text-center" v-for="item in filterItems" @click="openItem(item)">
                    <div>
                        <NIcon color="green" :component="item.icon" :size="30"></NIcon>
                    </div>
                    <div>
                        {{ item.name }}
                    </div>
                    <NDrawer :height="400" v-model:show="item.show" placement="bottom">
                        <NDrawerContent :title="'筛选：' + item.name" closable>
                            <component :is="item.component"></component>
                        </NDrawerContent>
                    </NDrawer>
                </NGi>
            </NGrid>
        </NDrawerContent>
    </NDrawer>
</template>

<script setup lang="ts">
import { 
    AirplaneOutline, BatteryChargingOutline, BatteryDeadOutline, 
    BatteryFullOutline, BatteryHalfOutline, BedOutline, BicycleOutline, 
    BoatOutline, CarOutline, CellularOutline, ChatbubbleEllipsesOutline, CheckboxOutline, CheckmarkDoneOutline, CloudCircleOutline, 
    Expand, 
    Filter, 
    HappyOutline, ManOutline, PlanetOutline, TimeOutline, TimerOutline, TrainOutline 
} from '@vicons/ionicons5'
import { 
    NButton, NDatePicker, NDrawer, NDrawerContent, NGi, NGrid, NIcon, 
    NIconWrapper, NList, NListItem, NTag 
} from 'naive-ui'
import { Type } from 'naive-ui/es/button/src/interface'
import { computed, h, ref, watch } from 'vue'
import { useUserStore } from '../store/user'
import { Organization } from '../interface/typ'
import { storeToRefs } from 'pinia'
import { FilterOptions } from './Filter.ts'
import { useNotificationSenderRoles } from '../store/notification'

const { UserOrganizations, UserFollowingOrganizations } = storeToRefs(useUserStore())
const { sender_roles } = useNotificationSenderRoles()

const showFilter = ref(false)
const openFilter = () => {
    showFilter.value = true
}

const closeFilter = () => {
    showFilter.value = false
}

const organizations = computed(() => {
    const orgs = UserOrganizations.value.concat(UserFollowingOrganizations.value)
    // deduplicate
    const orgsMap = new Map<number, Organization>()
    for (const org of orgs) {
        orgsMap.set(org.id, org)
    }
    return Array.from(orgsMap.values())
})

const currentItem = ref(null as any)
const openItem = (item: {
    show: boolean,
}) => {
    item.show = true
    currentItem.value = item
}

const listItem = (
    icon: any, text: string, type: Type,
    click: () => void = () => {},
) => h(NListItem, { style: { padding: '8px' } }, {
    default: () => h(NButton, {
        text: true,
        type: type,
        onClick: () => {
            click()
            currentItem.value.show = false
        },
    }, {
        default: text,
        icon: () => h(NIcon, { component: icon })
    })
})

const filterItems = ref([
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => [
                listItem(AirplaneOutline, '十分钟内结束 - 急急急', 'error', () => {
                    filter.value.end_at = new Date(Date.now() + 10 * 60 * 1000).getTime()
                }),
                listItem(TrainOutline, '半小时内结束 - 紧急', 'warning', () => {
                    filter.value.end_at = new Date(Date.now() + 30 * 60 * 1000).getTime()
                }),
                listItem(CarOutline, '两小时内结束 - 还有时间', 'info', () => {
                    filter.value.end_at = new Date(Date.now() + 2 * 60 * 60 * 1000).getTime()
                }),
                listItem(CarOutline, '十二小时内结束 - 躺平', 'success', () => {
                    filter.value.end_at = new Date(Date.now() + 12 * 60 * 60 * 1000).getTime()
                }),
                listItem(BoatOutline, '二十四小时内结束 - 不急', 'primary', () => {
                    filter.value.end_at = new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(BicycleOutline, '三天内结束 - 没这事', 'primary', () => {
                    filter.value.end_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(HappyOutline, '半个月内结束 - 当不存在', 'default', () => {
                    filter.value.end_at = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(BedOutline, '一年内结束 - 睡觉', 'default', () => {
                    filter.value.end_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime()
                }),
                h(NDatePicker, {
                    type: 'datetime', placeholder: '自定义结束时间', bordered: false, clearable: true, size: 'small',
                    value: filter.value.end_at ? filter.value.end_at : new Date().getTime(),
                    onUpdateValue: (v: number) => {
                        filter.value.end_at = v
                    }
                }, {
                    prefix: () => '自定义',
                })
            ]
        }),
        icon: TimeOutline,
        name: '结束时间',
        show: false
    },
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => [
                listItem(AirplaneOutline, '十分钟内发布', 'primary', () => {
                    filter.value.start_at = new Date(Date.now() - 10 * 60 * 1000).getTime()
                }),
                listItem(TrainOutline, '半小时内发布', 'success', () => {
                    filter.value.start_at = new Date(Date.now() - 30 * 60 * 1000).getTime()
                }),
                listItem(CarOutline, '两小时内发布', 'info', () => {
                    filter.value.start_at = new Date(Date.now() - 2 * 60 * 60 * 1000).getTime()
                }),
                listItem(CarOutline, '十二小时内发布', 'info', () => {
                    filter.value.start_at = new Date(Date.now() - 12 * 60 * 60 * 1000).getTime()
                }),
                listItem(BoatOutline, '二十四小时内发布', 'warning', () => {
                    filter.value.start_at = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(BicycleOutline, '三天内发布', 'warning', () => {
                    filter.value.start_at = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(HappyOutline, '半个月内发布', 'error', () => {
                    filter.value.start_at = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime()
                }),
                listItem(BedOutline, '一年内发布', 'error', () => {
                    filter.value.start_at = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).getTime()
                }),
                h(NDatePicker, {
                    type: 'datetime', placeholder: '自定义发布时间', bordered: false, clearable: true, size: 'small',
                    value: filter.value.start_at ? filter.value.start_at : new Date().getTime(),
                    onUpdateValue: (v: number) => {
                        filter.value.start_at = v
                    }
                }, {
                    prefix: () => '自定义',
                })
            ]
        }),
        icon: TimerOutline,
        name: '发布时间',
        show: false
    },
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => organizations.value.map(
                org => listItem(PlanetOutline, org.name, 'info', () => {
                    filter.value.organization_id = org.id
                })
            )
        }),
        icon: CloudCircleOutline,
        name: '组织',
        show: false
    },
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => sender_roles.value.map(
                role => listItem(ManOutline, role.name, 'info', () => {
                    filter.value.sender_role = role.name
                })
            )
        }),
        icon: ManOutline,
        name: '发布者',
        show: false,
    },
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => {
                if (props.notification) {
                    return [
                        listItem(CheckmarkDoneOutline, '已读', 'success', () => {
                            filter.value.status = 'read'
                        }),
                        listItem(CheckboxOutline, '未读', 'error', () => {
                            filter.value.status = 'unread'
                        }),
                        listItem(CheckmarkDoneOutline, '已确认', 'success', () => {
                            filter.value.status = 'confirmed'
                        }),
                        listItem(CheckboxOutline, '未确认', 'error', () => {
                            filter.value.status = 'unconfirmed'
                        }),
                    ]
                } else if (props.task) {
                    return [
                        listItem(CheckmarkDoneOutline, '已完成', 'success', () => {
                            filter.value.status = 'done'
                        }),
                        listItem(CheckboxOutline, '未完成', 'error', () => {
                            filter.value.status = 'notdone'
                        }),
                    ]
                }
            }
        }),
        icon: CheckboxOutline,
        name: '状态',
        show: false
    },
    {
        component: () => h(NList, { padding: 0 }, {
            default: () => [
                listItem(BatteryChargingOutline, '10 - 我急了我急了我急了', 'error', () => {
                    filter.value.priority = 10
                }),
                listItem(BatteryChargingOutline, '9 - 急急急急急', 'error', () => {
                    filter.value.priority = 9
                }),
                listItem(BatteryFullOutline, '8 - 紧急', 'error', () => {
                    filter.value.priority = 8
                }),
                listItem(BatteryFullOutline, '7 - 重要', 'warning', () => {
                    filter.value.priority = 7
                }),
                listItem(BatteryFullOutline, '6 - 比较重要', 'warning', () => {
                    filter.value.priority = 6
                }),
                listItem(BatteryHalfOutline, '5 - 一般', 'warning', () => {
                    filter.value.priority = 5
                }),
                listItem(BatteryHalfOutline, '4 - 普通', 'info', () => {
                    filter.value.priority = 4
                }),
                listItem(BatteryHalfOutline, '3 - 日常通知', 'info', () => {
                    filter.value.priority = 3
                }),
                listItem(BatteryDeadOutline, '2 - 无关紧要', 'info', () => {
                    filter.value.priority = 2
                }),
                listItem(BatteryDeadOutline, '1 - 小事', 'primary', () => {
                    filter.value.priority = 1
                }),
                listItem(BatteryDeadOutline, '0 - 忽略', 'primary', () => {
                    filter.value.priority = 0
                }),
            ]
        }),
        icon: CellularOutline,
        name: '优先级',
        show: false
    },
])

const filter = ref({
    end_at: null,
    start_at: null,
    organization_id: null,
    priority: null,
    status: null,
    sender_role: null,
} as FilterOptions)

const caculateRelativeTime = (time: number) => {
    const now = Date.now()
    const diff = Math.abs(now - time) + 1000
    if (diff < 60 * 1000) {
        return '刚刚'
    } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / 60 / 1000) + '分钟'
    } else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / 60 / 60 / 1000) + '小时'
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / 24 / 60 / 60 / 1000) + '天'
    } else {
        return Math.floor(diff / 7 / 24 / 60 / 60 / 1000) + '周'
    }
}

const filterTags = computed(() => {
    const tags = []
    if (filter.value.end_at) {
        tags.push('在' + caculateRelativeTime(filter.value.end_at) + '内结束')
    }
    if (filter.value.start_at) {
        tags.push('在' + caculateRelativeTime(filter.value.start_at) + '内发布')
    }
    if (filter.value.organization_id) {
        const org = organizations.value.find(org => org.id === filter.value.organization_id)
        if (org) {
            tags.push('组织：' + org.name)
        }
    }
    if (filter.value.priority) {
        tags.push('优先级：' + filter.value.priority)
    }
    if (filter.value.status) {
        tags.push('状态：' + filter.value.status)
    }
    if (filter.value.sender_role) {
        tags.push('发布者：' + filter.value.sender_role)
    }
    return tags
})

const handleCloseTag = (index: number) => {
    const tag = filterTags.value[index]
    if (tag.includes('内结束')) {
        filter.value.end_at = null
    } else if (tag.includes('内发布')) {
        filter.value.start_at = null
    } else if (tag.includes('组织')) {
        filter.value.organization_id = null
    } else if (tag.includes('优先级')) {
        filter.value.priority = null
    } else if (tag.includes('状态')) {
        filter.value.status = null
    } else if (tag.includes('发布者')) {
        filter.value.sender_role = null
    }
}

const updateEmit = defineEmits<{
    (event: 'update', filter: FilterOptions): void
}>()

watch(filter, () => {
    updateEmit('update', filter.value)
}, { deep: true })

const props = defineProps({
    height: {
        type: [Number, String],
        default: 35,
    },
    task: {
        type: Boolean,
        default: false,
    },
    notification: {
        type: Boolean,
        default: false,
    }
})

</script>

<style scoped>
.b-c-filter{
    background-color: white;
}

.b-c-filter-container {
    display: flex;
    justify-content: left;
    align-items: center;
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-color: transparent transparent; /* 设置滚动条颜色为透明 */
}

.b-c-filter-tags {
    background-color:white;
    padding: 8px;
}

.b-c-filter-container::-webkit-scrollbar-thumb {
    background-color: transparent;
}

.b-c-filter-container::-webkit-scrollbar {
  width: 0
}
</style>