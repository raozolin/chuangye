<template>
    <div class="b-v-scanner" ref="scanner"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { scanQRCode } from '../utils/native'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

const scanner = ref<HTMLDivElement | null>(null)
const message = useMessage()
let scannerController: any = null

const result = ref('')

const onMarked = (typ: any, _result: string) => {
    result.value = _result
    scannerController.close()
    const frontUrl = (import.meta as any).env.VITE_APP_FRONTEND_BASE_URL
    if (_result.startsWith(frontUrl)) {
        router.back()
        setTimeout(() => {
            router.push(_result.replace(frontUrl, ''))
        }, 100)
    } else {
        message.error('无效的二维码')
    }
}

const onError = (err: any) => {
    message.error(err)
    scannerController.close()
}

onMounted(() => {
    if (!scanner.value) return
    scannerController = scanQRCode(scanner.value, onMarked, onError)
})

onBeforeUnmount(() => {
    if (scannerController) {
        scannerController.close()
    }
})
</script>

<style scoped>
.b-v-scanner {
    width: 100%;
    min-height: 100%;
    background-color: white;
}

</style>