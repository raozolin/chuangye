<script setup lang="ts">
import {
  NConfigProvider,
  NLayout,
  NSpace,
  NMessageProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NNotificationProvider,
  zhCN,
  dateZhCN,
} from "naive-ui";
import Header from "./layout/Header.vue";
import Footer from "./layout/Footer.vue";
import Body from "./layout/Body.vue";
import { refreshLoginStatus } from "./middleware/auth/login";
import { onMounted } from "vue";
import PopBottom from "./layout/PopBottom.vue";
import Overlay from "./layout/Overlay.vue";

onMounted(() => {
  setTimeout(() => refreshLoginStatus());
});
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN">
    <NDialogProvider>
      <NLoadingBarProvider>
        <NMessageProvider>
          <NNotificationProvider>
            <NSpace vertical>
              <NLayout>
                <Header />
                <Body />
                <Footer />
                <PopBottom />
                <Overlay />
              </NLayout>
            </NSpace>
          </NNotificationProvider>
        </NMessageProvider>
      </NLoadingBarProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style>
body {
  --header-height: 57px;
  overflow: hidden;
}
</style>
