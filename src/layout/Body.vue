<template>
    <NLayoutContent class="m-l-body" :style="bodyStyle">
        <RouterView v-slot="{ Component }">
            <Transition name="slide">
                <KeepAlive :include="['Notification', 'Task']">
                    <component :is="Component" :key="$route.fullPath" />
                </KeepAlive>
            </Transition>
        </RouterView>
    </NLayoutContent>
</template>

<script setup lang="ts">
import { NLayoutContent } from 'naive-ui'
import { Transition, computed, onMounted } from 'vue'
import { setupScroll } from './event'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'

const { UserOnline } = storeToRefs(useUserStore())

onMounted(() => {
    const el = document.querySelector('.m-l-body')?.children[0]
    setupScroll(el as HTMLElement)
})

const bodyStyle = computed(() => {
    if (UserOnline.value) {
        return {
            height: 'calc(100vh - var(--header-height) - 50px)',
        }
    } else {
        return {
            height: 'calc(100vh - var(--header-height))',
        }
    }
})

</script>

<style scoped>
.m-l-body {
    background-color: #f0f0eb;
    overflow-y: auto;
}

.slide-enter-active {
    animation: slide-in 0.5s;
}

.slide-leave-active {
    animation: slide-out 0.5s;
}

@keyframes slide-in {
    0% {
        opacity: 0;
        transform: translateX(-100px);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slide-out {
    0% {
        transform: translateX(0);
        opacity: 1;
    }

    100% {
        transform: translateX(100vw);
        opacity: 0;
        position: absolute;
    }
}
</style>

