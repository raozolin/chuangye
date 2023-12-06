<template>
    <div class="b-l-overlay" :style="overlayStyle" @click="closeOverlay"></div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)

let afterClose: () => void
const _zIndex = ref(1000)

const overlayStyle = computed(() => {
    return {
        zIndex: _zIndex.value,
        display: open.value ? 'block' : 'none'
    }
})

const openOverlay = ({
    onClose,
    zIndex = 1000
}: {
    onClose: () => void,
    zIndex?: number
}) => {
    afterClose = onClose
    _zIndex.value = zIndex
    open.value = true
}

const closeOverlay = () => {
    open.value = false
    afterClose()
}

export const useOverlay = () => {
    return {
        openOverlay,
        closeOverlay
    }
}

export default {
    setup() {
        return {
            open,
            overlayStyle,
            closeOverlay
        }
    }
}
</script>

<style scoped>
.b-l-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    backdrop-filter: blur(5px);
}

</style>