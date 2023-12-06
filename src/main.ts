import "./utils/native";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import { createPinia } from "pinia";

import "vfonts/Lato.css";
import "./styles/common.css";
import { i18n } from "./locale/index";

import axios from "axios";

axios.defaults.baseURL = (import.meta as any).env.VITE_APP_BACKEND_BASE_URL;
axios.defaults.withCredentials = true;

// load version first, check if current version is latest
import { apiGetVersion } from "./interface/version";

apiGetVersion().then((res) => {
  if (!res.isSuccess()) {
    console.error("Failed to get version, please check backend status");
    return;
  }

  if (res.data?.version.version !== (import.meta as any).env.VITE_APP_VERSION) {
    console.log("New version detected, reloading...");
    window.location.reload();
    return;
  }
  createApp(App).use(router).use(i18n).use(createPinia()).mount("#app");
});
