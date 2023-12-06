<template>
    <div class="b-c-click-captcha" :style="style">
        <img class="img" :src="props.src" @click="handleClick" ref="img" />
        <div class="prompt">
            请依次点击 {{ props.prompt.split('').join('，') }} 后继续操作
        </div>
        <div class="answer" 
            v-for="(item, index) in answer" 
            :key="index" 
            :style="{left: item.x + 'px', top: item.y + 'px'}"
            @click="remove(index)"
        >
            {{ index + 1 }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const img = ref<HTMLImageElement | null>(null)

const props = defineProps({
    width: {
        type: [Number, String],
        default: 300
    },
    height: {
        type: [Number, String],
        default: 100
    },
    src: {
        type: String,
        default: ''
    },
    prompt: {
        type: String,
        default: 'abc'
    }
})

const style = computed(() => {
    const width = typeof props.width === 'number' ? `${props.width}px` : props.width
    const height = typeof props.height === 'number' ? `${props.height}px` : props.height
    return {
        width,
        height,
    }
})

type AnswerPoint = {
    x: number
    y: number
}

const answer = ref<AnswerPoint[]>([])
const emit = defineEmits<{
    (event: 'update', value: string): void
}>()

const remove = (index: number) => {
    answer.value.splice(index, 1)
    const rect = img.value?.getBoundingClientRect()
    if (!rect) return

    const { width, height } = rect

    const value = answer.value.map(item => `${Math.round(item.x / width * 320)},${Math.round(item.y / height * 90)}`).join(',')
    emit('update', value)
}

const handleClick = (e: MouseEvent) => {
    const { offsetX, offsetY } = e
    const answerPoint: AnswerPoint = {
        x: offsetX,
        y: offsetY
    }
    answer.value.push(answerPoint)
    // get img width and height from img element
    const rect = img.value?.getBoundingClientRect()
    if (!rect) return

    const { width, height } = rect

    // calculate the real position of the click point, image size is 320 * 90
    console.log(answerPoint.y / height * 90)
    const value = answer.value.map(item => `${Math.round(item.x / width * 320)},${Math.round(item.y / height * 90)}`).join(',')
    emit('update', value)
}

watch(() => props.src, () => {
    answer.value = []
})

</script>

<style scoped>
.b-c-click-captcha {
    position: relative;
    border: #4b9e5f solid 1px;
    border-radius: 8px;
}

.img {
    width: 100%;
    height: calc(100% - 25px);
    border-radius: 8px;
    object-fit: fill;
}

.prompt {
    position: absolute;
    bottom: 0;
    height: 24px;
    color: white;
    width: 100%;
    text-align: center;
    background-color: #4b9e5f;
    line-height: 24px;
    font-size: 12px;
    border-radius: 0 0 8px 8px;
}

.answer {
    position: absolute;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    background-color: #4b9e5f;
    color: white;
    font-size: 12px;
    margin-left: -10px;
    margin-top: -10px;
}
</style>