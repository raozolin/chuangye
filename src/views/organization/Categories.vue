<template>
    <div class="b-v-categories">
        <NResult style="margin: 30px;" title="选择组织" :description="isFirst ? '这是你第一次进入发布册，为了更好的发布与接收，你可以选择想加入的组织' : '选择您的筛选条件'">
            <template #icon>
                <NIcon :component="BalloonOutline" size="64" color="green"></NIcon>
            </template>
        </NResult>
        <NGrid class="text-white mt2 " cols="1" x-gap="12" y-gap="3">
            <NGi class="category mx2" @click="router.push('/organization/nearby')">
                <NThing content-indented>
                    <template #avatar>
                        <NIcon :component="Location" :size="20" color="white"></NIcon>
                    </template>
                    <template #header>
                        <div class="text-white">
                            地理位置
                        </div>
                    </template>
                    <template #header-extra>
                        <NIcon :component="OpenOutline" color="white"></NIcon>
                    </template>
                    <div class="text-white">
                        位于您地理位置附近的组织，适用于地理位置强关联的组织
                    </div>
                </NThing>
            </NGi>
            <NGi class="category mx2" @click="router.push('/organization/types')">
                <NThing content-indented>
                    <template #avatar>
                        <NIcon :component="Grid" :size="20" color="white"></NIcon>
                    </template>
                    <template #header>
                        <div class="text-white">
                            类型
                        </div>
                    </template>
                    <template #header-extra>
                        <NIcon :component="OpenOutline" color="white"></NIcon>
                    </template>
                    <div class="text-white">
                        使用组织类型进行筛选，例如学校、公司、社团等
                    </div>
                </NThing>
            </NGi>
            <NGi class="category mx2">
                <NThing content-indented @click="router.push('/organization/search')">
                    <template #avatar>
                        <NIcon :component="IdCard" :size="20" color="white"></NIcon>
                    </template>
                    <template #header>
                        <div class="text-white">
                            名称
                        </div>
                    </template>
                    <template #header-extra>
                        <NIcon :component="OpenOutline" color="white"></NIcon>
                    </template>
                    <div class="text-white">
                        使用组织名称进行筛选，如果您知道组织名称，可以直接搜索
                    </div>
                </NThing>
            </NGi>
        </NGrid>
    </div>
</template>

<script setup lang="ts">
import { BalloonOutline, Grid, IdCard, Link, Location, Open, OpenOutline, SearchCircleOutline } from '@vicons/ionicons5'
import { NGi, NGrid, NIcon, NResult, NThing } from 'naive-ui'
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const route = useRoute()
const router = useRouter()

const isFirst = ref(route.query.is_first === 'true')

onMounted(() => {
    if(isFirst.value) {
        userStore.intro()
    }
})

</script>

<style scoped>
.b-v-categories {
    background-color: white;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.category {
    background: rgb(28, 192, 77);
    border-radius: 8px;
    padding: 12px;
}

</style>