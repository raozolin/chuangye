<template>
    <div class="b-v-introduction">
        <NResult size="large" title="发布册" description="欢迎来到发布册，马上开始我们的第一步！">
            <template #icon>
                <img width="192" height="192" :src="getAssetsFile('logo.png')" />
            </template>
            <template #footer>
                <NButton type="primary" class="w60" @click="router.push('/organization/categories?is_first=true')">
                    <template #icon>
                        <NIcon :component="Enter"></NIcon>
                    </template>
                    开始
                </NButton>
            </template>
        </NResult>
    </div>
</template>

<script setup lang="ts">
import { NAvatar, NButton, NIcon, NImage, NResult } from 'naive-ui'
import { getAssetsFile } from '../utils'
import { Enter } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.b-v-introduction {
    padding-top: 100px;
    background-color: white;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>