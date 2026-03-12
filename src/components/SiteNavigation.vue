<template>
  <header class="sticky top-0 border-b border-white/10 bg-weather-primary shadow-lg">
    <nav class="container flex items-center justify- gap-4 py-6 text-white ">
      <RouterLink :to="{ name: 'home' }" class="flex-1 items-center gap-3">
        <div class="flex items-center gap-3 ">
          <span class="text-2xl leading-none" aria-hidden="true">☀</span>
          <p class="text-2xl font-bold tracking-tight">Weather App</p>
        </div>
      </RouterLink>
      <i @click="toggleModal"
        class="fa-solid fa-circle-exclamation text-2xl hover:text-weather-secondary transition-colors duration-300 cursor-pointer"></i>
      <i @click="addCity" v-if="route.query.adcode"
        class="fa-solid fa-plus  text-2xl hover:text-weather-secondary transition-colors duration-300 cursor-pointer"></i>
      <BaseModal :show="showModal" @close-modal="toggleModal">
        <h2 class="text-2xl font-bold mb-4 text-black">About This App</h2>
        <p class="mb-4 text-black">
          此天气应用为您的位置提供准确和最新的天气信息。它具有用户友好的界面，
          并使用 Vue.js 构建。
        </p>
      </BaseModal>
    </nav>
  </header>
</template>

<script setup>
  import { uid } from "uid";

  const showModal = ref(false);
  const savedCities = ref([]);
  const route = useRoute();
  const router = useRouter();


  function toggleModal() {
    showModal.value = !showModal.value;
  }

  const addCity = () => {
    if (localStorage.getItem("savedCities")) {
      savedCities.value = JSON.parse(localStorage.getItem("savedCities"));
    }

    const locationObj = {
      id: uid(),
      province: route.params.province,
      city: route.params.city,
      adcode: route.query.adcode,
    };

    savedCities.value.push(locationObj)
    localStorage.setItem("savedCities", JSON.stringify(savedCities.value));
    alert("城市已添加到收藏！");

    let query = Object.assign({}, route.query);
    delete query.adcode;
    router.replace({ query });
    console.log(savedCities.value);

  };
</script>
