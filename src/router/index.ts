import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        title: "天气预报 - 首页"
      }
    },
    {
      path: "/weather/:province/:city",
      name: "cityview",
      component: () => import("../views/CityView.vue")
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
