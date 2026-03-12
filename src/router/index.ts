import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CityView from "../views/CityView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "天气预报 - 首页"
      }
    },
    {
      path: "/weather/:province/:city",
      name: "cityview",
      component: CityView
      , meta: {
        title: "天气预报 - 城市详情"
      }
    },

  ],
});

router.beforeEach((to, from, next) => {
  document.title = `${to.params.province ?
    `${to.params.province},${to.params.city}`
    : to.matched[0]?.meta.title || '天气预报'}`;
  next()
})

export default router;

