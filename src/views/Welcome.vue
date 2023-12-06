<template>
    <div class="b-v-welcome">
        <NResult style="padding-top: 50px;" size="medium" title="发布册" description="">
            <template #icon>
                <img width="192" height="192" :src="getAssetsFile('logo.png')" />
            </template>
        </NResult>
        <div style="position: absolute; bottom: 200px; width: 100%;">
            <div class="text-center text-20">
                <span style="color: #49a55e; ">发布</span>一切你想传达
            </div>
            <div class="text-center text-20 mt3">
                <span style="color: #2080f0; ">整合</span>所有你想了解
            </div>
        </div>
        <NButton size="large" style="position: absolute; bottom: 100px; width: 60%; margin-left: 20%;" type="primary" @click="start">
            <template #icon>
                <NIcon :component="Enter"></NIcon>
            </template>
            前往登录
        </NButton>
    </div>
</template>

<script setup lang="ts">
import { NAvatar, NButton, NIcon, NResult } from 'naive-ui'
import { getAssetsFile } from '../utils'
import { useRouter } from 'vue-router'
import { Enter } from '@vicons/ionicons5'
import { useUserStore } from '../store/user'

const userStore = useUserStore()

const router = useRouter()

const start = () => {
    userStore.setWelcome(true)
    router.push('/login')
}

</script>

<style scoped>
.b-v-welcome {
    min-height: 100%;
    background-color: white;
}
</style>