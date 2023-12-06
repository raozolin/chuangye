<template>
    <div class="b-v-types">
        <NResult title="选择组织类型" status="404"></NResult>
        <NGrid class="text-white mt2" cols="2" x-gap="3" y-gap="3">
            <NGi v-for="t in types" class="types" @click="open(t.name)">
                <NThing content-indented>
                    <template #avatar>
                        <NIcon :component="t.icon" :size="20" color="white"></NIcon>
                    </template>
                    <template #header>
                        <div class="text-white">
                            {{ t.name }}
                        </div>
                    </template>
                    <template #header-extra>
                        <NIcon :component="OpenOutline" color="white"></NIcon>
                    </template>
                    <div class="text-white">
                        {{ t.description }}
                    </div>
                </NThing>
            </NGi>
        </NGrid>
        <NDrawer v-model:show="showSearch" placement="bottom" :height="600">
            <NDrawerContent closable :title="`为您推荐的${typeCode2Name(searchType)}组织`">
                <NThing class="mb3" v-if="!searching && searchResult.length > 0" v-for="org in searchResult" @click="toOrganization(org.id)">
                    <template #avatar>
                        <NBadge v-if="org.is_official" color="green" :offset="[-8, 40]">
                            <template #value>
                                <NIcon :component="CheckmarkDone"></NIcon>
                            </template>
                            <NAvatar round :size="44" :src="org.avatar"></NAvatar>
                        </NBadge>
                        <NAvatar v-else round :size="44" :src="org.avatar"></NAvatar>
                    </template>
                    <template #header>
                        {{ org.name }}
                    </template>
                    <template #description>
                        <NTime :time="new Date(org.created_at || 0)" :to="new Date()" type="relative"></NTime>建立
                    </template>
                </NThing>
                <NSpin v-else-if="searching" size="large" class="w100"></NSpin>
                <NEmpty v-else description="没有找到符合条件的组织"></NEmpty>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<script setup lang="ts">
import { BalloonOutline, BedOutline, BusinessOutline, CameraOutline, CheckmarkDone, FastFoodOutline, Grid, HappyOutline, IdCard, Link, Location, MusicalNotesOutline, Open, OpenOutline, SchoolOutline, SearchCircleOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'
import { NAvatar, NBadge, NDrawer, NDrawerContent, NEmpty, NGi, NGrid, NIcon, NResult, NSpin, NThing, NTime, useDialog, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getLocationBulk } from '../../utils/location'
import { typeCode2Name, typeName2Code } from '../../utils/organization_types'
import { Organization } from '../../interface/typ'
import { apiOrganizationSearchByBulk } from '../../interface/organization'

const userStore = useUserStore()
const message = useMessage()

const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const isFirst = ref(route.query.is_first === 'true')

const types = ref([{
    name: '高等院校',
    icon: SchoolOutline,
    description: '具有教育部认证的高等院校',
}, {
    name: '政府机构',
    icon: ShieldCheckmarkOutline,
    description: '官方政府机构'
}, {
    name: '企业',
    icon: BusinessOutline,
    description: '已在工商行政管理局注册的企业'
}, {
    name: '社团',
    icon: BalloonOutline,
    description: '社会团体、民办非企业单位'
}, {
    name: '娱乐',
    icon: MusicalNotesOutline,
    description: '娱乐场所、旅游景点等'
}, {
    name: '展会',
    icon: HappyOutline,
    description: '展会、会议、演出等'
}, {
    name: '餐饮',
    icon: FastFoodOutline,
    description: '餐饮行业，例如餐馆、酒吧等'
}, {
    name: '住宿',
    icon: BedOutline,
    description: '酒店、旅馆、民宿等'
}, {
    name: '影视',
    icon: CameraOutline,
    description: '影视行业，例如电影院、剧院、官媒等'
}, {
    name: '其他',
    icon: Link,
    description: '其他类型的组织'
}])

const open = async (name: string) => {
    try {
        const posistion = await getLocationBulk()
        if (!posistion) {
            message.error('获取地理位置失败，请检查您的网络连接或App权限设置')
            return
        }
        const typeCode = typeName2Code(name)
        searchType.value = typeCode
        startSearch(posistion.coords.latitude, posistion.coords.longitude)
    } catch (e) {
        message.error('获取地理位置失败，请检查您的网络连接或App权限设置')
        return
    }
}

const showSearch = ref(false)
const searching = ref(false)
const searchResult = ref<Organization[]>([])
const searchType = ref('')
const searchKeyword = ref('')
const startSearch = async (lat: number, lng: number) => {
    showSearch.value = true
    searching.value = true
    const organizations = await apiOrganizationSearchByBulk('', lng, lat, searchType.value, true)
    searching.value = false
    if (!organizations.isSuccess()) {
        message.error(organizations.getError())
        return
    }

    searchResult.value = organizations.data?.organizations || []
}

const toOrganization = (id: number) => {
    router.push(`/organization/detail/${id}`)
}

</script>

<style scoped>
.b-v-types {
    background-color: white;
    padding: 8px;
    overflow: hidden;
    min-height: calc(100% - 16px);
}

.types {
    background: rgb(28, 192, 77);
    border-radius: 8px;
    padding: 12px;
}
</style>