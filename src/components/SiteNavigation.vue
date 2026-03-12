<template>
  <header
    class="fixed top-0 w-full z-50 transition-all duration-500 py-6 px-4 md:px-12 flex justify-between items-center">
    <RouterLink :to="{ name: 'home' }" class="group flex items-center gap-2">
      <div class="w-3 h-3 rounded-full bg-current transition-transform duration-500 group-hover:scale-150"></div>
      <p class="text-sm font-semibold tracking-widest uppercase ml-2">WTHR.studio</p>
    </RouterLink>

    <div class="flex items-center gap-6">
      <button @click="toggleModal" class="hover:opacity-60 transition-opacity duration-300" aria-label="About">
        <Info class="w-5 h-5" stroke-width="1.5" />
      </button>
      <button @click="addCity" v-if="route.query.adcode" class="hover:opacity-60 transition-opacity duration-300"
        aria-label="Add City">
        <Plus class="w-5 h-5" stroke-width="1.5" />
      </button>
    </div>

    <BaseModal :show="showModal" @close-modal="toggleModal">
      <div class="p-8 pb-12">
        <h2 class="text-3xl font-light mb-8 tracking-tight text-brand-primary">Concept.</h2>
        <p class="text-brand-muted leading-relaxed font-light text-lg">
          A sophisticated weather visualization tool. Accurately delivering atmospheric conditions
          through a minimalist, avant-garde lens. Built with Vue.js for high-performance interactions.
        </p>
      </div>
    </BaseModal>
  </header>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRoute, useRouter, RouterLink } from 'vue-router';
  import { uid } from 'uid';
  import { Info, Plus } from 'lucide-vue-next';

  const showModal = ref(false);
  const savedCities = ref([]);
  const route = useRoute();
  const router = useRouter();

  function toggleModal() {
    showModal.value = !showModal.value;
  }

  const addCity = () => {
    if (localStorage.getItem('savedCities')) {
      savedCities.value = JSON.parse(localStorage.getItem('savedCities'));
    }

    const locationObj = {
      id: uid(),
      province: route.params.province,
      city: route.params.city,
      adcode: route.query.adcode,
    };

    savedCities.value.push(locationObj)
    localStorage.setItem('savedCities', JSON.stringify(savedCities.value));

    let query = Object.assign({}, route.query);
    delete query.adcode;
    router.replace({ query });
  };
</script>
