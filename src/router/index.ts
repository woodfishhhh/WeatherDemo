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
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
      meta: {
        title: "天气预报 - 页面未找到"
      }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const pageTitle = to.params.province
    ? `${to.params.province},${to.params.city}`
    : to.meta.title || "天气预报";

  document.title = `${pageTitle}`;
  next()
})

export default router;
