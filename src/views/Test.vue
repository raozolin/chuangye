<template>
    <div>
        <NInput mode="" type="text" size="large" placeholder="大" v-model:value="input"/>
        <NButton type="primary" dashed @click="add" :disabled="disabled">
        add1
        </NButton>
        <div v-if="disabled">
            {{ num }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { NButton, NInput, NInputNumber, messageDark, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'

const num=ref(0)
const input = ref('')
const disabled =ref(false)

const message = useMessage()

const add = () => {
    if (input.value === '') {
        return
    }
    num.value += parseInt(input.value)
    disabled.value = true

    setTimeout(() => {
        disabled.value = false
        message.info('ok')
    }, 3000)
}


</script>

<style>
.red{color: red;}
.font{font-size: 50px;}
</style>