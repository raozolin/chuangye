<template>
    <div class="k-v-admin mx-auto">
        <NLayout>
            <NLayoutHeader>
                <NTabs type="card" v-model:value="currentName">
                    <NTabPane
                        v-for="route in routes"
                        :key="route.label"
                        :name="route.label"
                    ></NTabPane>
                </NTabs>
            </NLayoutHeader>
            <NLayoutContent class="px5">
                <router-view />
            </NLayoutContent>
        </NLayout>
    </div>
</template>

<script setup lang="ts">
import { OptionsOutline } from '@vicons/ionicons5'
import { NIcon, NLayout, NLayoutContent, NLayoutHeader, NTabPane, NTabs } from 'naive-ui'
import { Component, h, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const renderIcon = (icon: Component) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const routes = [{
    label: '资料',
    path: '/user/profile',
    icon: renderIcon(OptionsOutline),
}]
// }, {
//     label: '设置',
//     path: '/user/settings',
//     icon: renderIcon(SettingsOutline),
// }]

const currentName = ref(routes[0].label)

watch(currentName, () => {
    const route = routes.find(i => i.label === currentName.value)
    if (route) {
        router.push(route.path)
    }
}, { immediate: true })

</script>

<style scoped>
.k-v-admin {
    max-width: 1200px;
    min-height: 100%;
    background-color: white;
}
</style>