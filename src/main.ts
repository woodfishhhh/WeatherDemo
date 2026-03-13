import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "./firebase";
import "qweather-icons/font/qweather-icons.css";
import { useSettingsStore } from "@/features/settings/stores/settings";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

useSettingsStore(pinia).hydrate();

app.mount("#app");
