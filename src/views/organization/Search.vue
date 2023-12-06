<template>
    <div class="b-v-organization-search">
        <NInputGroup>
            <NInput @keypress.enter="search" ref="inputRef" placeholder="组织名关键词" v-model:value="keyword">
                <template #prefix>
                    <NIcon :size="24" :component="SearchCircle"></NIcon>
                </template>
            </NInput>
            <NButton type="primary" @click="search">搜索</NButton>
        </NInputGroup>
        <NEmpty v-if="organizations.length == 0" class="mt5" description="暂无内容"></NEmpty>
        <NList>
            <NListItem v-for="org in organizations">
                <NCard size="small" embedded>
                    <NThing>
                        <template #avatar>
                            <NBadge v-if="org.is_official" color="green" :offset="[-8, 40]">
                                <template #value>
                                    <NIcon :component="CheckmarkDone"></NIcon>
                                </template>
                                <NAvatar round :size="48" :src="org.avatar"></NAvatar>
                            </NBadge>
                            <NAvatar v-else round :size="48" :src="org.avatar"></NAvatar>
                        </template>
                        <template #header>
                            {{ org.name }}
                        </template>
                        <template #header-extra>
                            <NButton size="small" type="primary" @click="toOrganization(org.id)">
                                <template #icon>
                                    <NIcon :component="OpenOutline"></NIcon>
                                </template>
                                进入
                            </NButton>
                        </template>
                        <template #description>
                            <NTime :time="new Date(org.created_at || 0)" :to="new Date()" type="relative"></NTime>建立
                        </template>
                        <template #footer>
                            <NGrid :cols="3">
                                <NGi>
                                    <div class="text-center">
                                        <NIcon :size="24" color="pink" :component="HeartCircleOutline"></NIcon>
                                        <div>
                                            {{ org.profile?.likes || 0 }}
                                        </div>
                                    </div>
                                </NGi>
                                <NGi>
                                    <div class="text-center">
                                        <NIcon :size="24" color="green" :component="PeopleCircleOutline"></NIcon>
                                        <div>
                                            {{ org.profile?.members || 0 }} / {{ org.profile?.max_members || 0 }}
                                        </div>
                                    </div>
                                </NGi>
                                <NGi>
                                    <div class="text-center">
                                        <NIcon :size="24" color="green" :component="PulseSharp"></NIcon>
                                        <div>
                                            {{ org.profile?.attentions || 0 }}
                                        </div>
                                    </div>
                                </NGi>
                            </NGrid>
                        </template>
                    </NThing>
                </NCard>
            </NListItem>
        </NList>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiOrganizationSearchByTitle } from '../../interface/organization'
import { Organization } from '../../interface/typ'
import { InputInst, NAvatar, NBadge, NButton, NCard, NEmpty, NGi, NGrid, NIcon, NInput, NInputGroup, NList, NListItem, NThing, NTime, useLoadingBar, useMessage } from 'naive-ui'
import { CheckmarkDone, HeartCircleOutline, OpenOutline, PeopleCircleOutline, PulseSharp, SearchCircle } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const router = useRouter()
const loadingBar = useLoadingBar()
const message = useMessage()

const organizations = ref<Organization[]>([])

const keyword = ref('')

const search = async () => {
    if (keyword.value == '') {
        return
    }
    loadingBar.start()
    const response = await apiOrganizationSearchByTitle(keyword.value)
    loadingBar.finish()
    if (!response.isSuccess()) {
        message.error(response.getError())
        return
    }
    organizations.value = response.data?.organizations || []
}

const toOrganization = (id: number) => {
    router.push(`/organization/detail/${id}`)
}

const inputRef = ref<InputInst | null>(null)
const focusInput = () => {
    inputRef.value?.focus()
}

onMounted(() => {
    focusInput()
})

</script>

<style scoped>
.b-v-organization-search {
    background-color: white;
    padding: 8px;
    min-height: 80vh;
}
</style>