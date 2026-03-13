import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        title: "Weather Forecast / 天气预报"
      }
    },
    {
      path: "/weather/:province/:city",
      name: "cityview",
      component: () => import("../views/CityView.vue")
      , meta: {
        title: "City Forecast / 城市天气"
      }
    },
    {
      path: "/workspace",
      name: "workspace",
      component: () => import("../views/WorkspaceView.vue"),
      meta: {
        title: "Workspace / 工作台"
      }
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: {
        title: "Settings / 设置"
      }
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
      meta: {
        title: "Page Missing / 页面未找到"
      }
    },
  ],
});

router.beforeEach((to) => {
  const pageTitle = to.params.province
    ? `${to.params.city} Weather / ${to.params.province} · ${to.params.city}天气`
    : to.meta.title || "Weather Forecast / 天气预报";

  document.title = `${pageTitle}`;
});

export default router;
