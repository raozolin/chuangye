<template>
    <div class="bigContent">
        <div class="contentMain">
            <img ref="imageVal" :src="originImage" class="imgClass" />
        </div>
        <div class="bigImgPD">
            <van-button block class="bigImgBtn" color="#004098" @click="save">
                确认
            </van-button>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
const props = defineProps({
    originImage: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['clipImg']);
const imageVal = ref<HTMLImageElement>();
const cropperObj = reactive({
    afterImg: '',
    myCropper: null as unknown as Cropper
})
onMounted(() => {
    if (imageVal.value) {
        cropperObj.myCropper = new Cropper(imageVal.value as any, {
            viewMode: 1,
            dragMode: 'move',
            guides: false,
            center: false,
            aspectRatio: 0.8,
            background: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            autoCrop: true,
            autoCropArea: 0.95,
            zoomOnWheel: true,
        })
    }
})
const save = () => {
    cropperObj.afterImg = cropperObj.myCropper.getCroppedCanvas({
        imageSmoothingQuality: 'high'
    }).toDataURL('image/jpeg')
    emit('clipImg', cropperObj.afterImg);//把裁剪的图片返回到父组件
}
</script>
