<template>
    <div class="b-v-organization-nearby">
        <BMap :enable-modify="false" :enable-add-center-marker="false" enable-search @on-locate="handleLocate" mode="multi"
            v-model:points="mapPoints"></BMap>
    </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { usePopBottom } from '../../layout/PopBottom.vue'
import { apiOrganizationSearchNearby } from '../../interface/organization'
import { Organization } from '../../interface/typ'
import { NAvatar, NBadge, NBlockquote, NBreadcrumb, NBreadcrumbItem, NButton, NDivider, NH1, NH2, NH3, NIcon, NImage, NPageHeader, NText, NThing, NTime, useMessage } from 'naive-ui'
import BMap from '../../component/BMap.vue'
import { getAssetsFile } from '../../utils'
import { useRouter } from 'vue-router'
import { CheckmarkDone } from '@vicons/ionicons5'

const popBottom = usePopBottom()
const message = useMessage()
const router = useRouter()

// default position is Beijing
const posistion = ref({
    lng: 116.404,
    lat: 39.915
})
const handleLocate = (position: { lng: number, lat: number }) => {
    posistion.value = position
    loadOrganizations()
}
const organizations = ref([] as Organization[])
const mapPoints = computed(() => {
    return organizations.value.map((organization) => {
        return {
            lng: organization.point.x,
            lat: organization.point.y,
            blue: organization.is_official,
            click: () => {
                popBottom.open({
                    onClose: () => { },
                    title: `详情`,
                    render: () => h(NPageHeader, {}, {
                        'header': () => h(NBreadcrumb, {}, {
                            default: () => [
                                h(NBreadcrumbItem, null, { default: () => '组织' }),
                                h(NBreadcrumbItem, null, { default: () => '附近' }),
                                h(NBreadcrumbItem, null, { default: () => '详情' }),
                                h(NBreadcrumbItem, null, { default: () => organization.name })
                            ]
                        }),
                        'title': () => organization.name,
                        'extra': () => h(NButton, { 
                            type: 'primary',
                            onClick: () => {
                                popBottom.close()
                                router.push(`/organization/detail/${organization.id}`)
                            }
                        }, { 
                            default: () => '进入' 
                        }),
                        'avatar': () => {
                            if (organization.is_official) {
                                return h(NBadge, { color: 'green', offset: [0, 40] }, {
                                    value: () => h(NIcon, { component: CheckmarkDone }),
                                    default: () => h(NAvatar, { 
                                        round: true, size: 48, src: organization.avatar,
                                    })
                                })
                            }
                            return h(NAvatar, { 
                                round: true, size: 48, src: organization.avatar,
                            })
                        },
                        'default': () => h(NBlockquote, {}, {
                            default: () => [
                                h('div', {}, {
                                    default: () => `简介：${organization.description}`
                                }),
                                h('span', '创建于：'),
                                h(NText, { type: 'primary' }, {
                                    default: () => [
                                        h(NTime, {
                                            type: 'relative',
                                            time: new Date(organization.created_at),
                                            to: new Date()
                                        })
                                    ]
                                })
                            ]
                        }),
                    })
                })
            }
        }
    })
})
const loadOrganizations = async () => {
    const response = await apiOrganizationSearchNearby(
        posistion.value.lng, posistion.value.lat
    )

    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }

    organizations.value = response.data?.organizations || []
}

</script>

<style scoped>
.b-v-organization-nearby {
    height: calc(100vh - var(--header-height) - 50px);
}
</style>