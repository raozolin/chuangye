<template>
    <div class="b-l-pop-bottom" :style="style">
        <NThing style="height: 100%;">
            <template #header>
                {{ _title }}
            </template>
            <template #header-extra>
                <NButton circle type="primary" text @click="close">
                    <NIcon :size="28" :component="CloseCircleOutline"></NIcon>
                </NButton>
            </template>
            <!-- @vue-ignore -->
            <component :is="realComponent" />
        </NThing>
    </div>
</template>

<script lang="ts">
import { VNodeChild, computed, h, onMounted, ref } from 'vue'
import { useOverlay } from './Overlay.vue'
import { NButton, NIcon, NThing } from 'naive-ui'
import { CloseCircleOutline } from '@vicons/ionicons5'

const overlay = useOverlay()

const isOpen = ref(false)
const style = computed(() => {
    return {
        transform: `translateY(${isOpen.value ? 0 : '50vh'})`
    }
})

const renderFunc = ref(null as unknown as () => VNodeChild | null)
const realComponent = computed(() => {
    return renderFunc.value ? renderFunc.value() : h('div')
})
const _title = ref('')
let afterClose: () => void

const open = ({
    onClose = () => {},
    render,
    title,
} : {
    onClose?: () => void,
    render: () => VNodeChild,
    title: string
}) => {
    afterClose = onClose
    renderFunc.value = render
    _title.value = title
    isOpen.value = true

    overlay.openOverlay({
        onClose: () => {
            isOpen.value = false
            afterClose()
        }
    })
}

const close = () => {
    overlay.closeOverlay()
    isOpen.value = false
    if (afterClose) {
        afterClose()
    }
}

export const usePopBottom = () => {
    return {
        open,
        close
    }
}

export default {
    components: {
        NButton, NIcon, NThing
    },
    setup() {
        return {
            _title,
            CloseCircleOutline,
            realComponent,
            close,
            style
        }
    },
}

</script>

<style>
.b-l-pop-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    width: calc(100% - 16px);
    height: 40vh;
    transition: height 0.5s;
    padding: 8px;
    z-index: 1001;
    background-color: white;
    transition: all 0.3s;
    border-radius:  16px 16px 0 0;
    /** top shadow */
    box-shadow: 0 -2px 8px 0 rgba(0, 0, 0, 0.15);
}

</style>