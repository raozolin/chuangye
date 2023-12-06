<template>
    <div class="m-v-home mx-auto my5">
        
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { onCheckedLogin } from '../middleware/auth/login'

const router = useRouter()

const { UserOnline } = storeToRefs(useUserStore())

onMounted(() => {
    onCheckedLogin(() => {
        if(!UserOnline.value) {
            router.push('/login')
        } else {
            router.push('/notification')
        }
    })
})


</script>

<style>

</style>