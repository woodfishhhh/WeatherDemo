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
      <a href="https://www.woodfishhhh.xyz/" target="_blank" rel="noopener noreferrer"
        class="hover:opacity-60 transition-opacity duration-300" aria-label="Author Blog">
        <User class="w-5 h-5" stroke-width="1.5" />
      </a>
    </div>

    <BaseModal :show="showModal" @close-modal="toggleModal">
      <div class="p-8 pb-12 text-white">
        <h2 class="text-3xl font-light mb-8 tracking-tight">理念.</h2>
        <p class="text-gray-300 leading-relaxed font-light text-lg mb-8">
          一款精致的天气可视化工具。通过极简、不受拘束的视角，准确传达大气状况。基于 Vue.js 构建，为您带来高性能的交互体验。
        </p>
        <a href="https://www.woodfishhhh.xyz/" target="_blank" rel="noopener noreferrer"
          class="inline-block px-6 py-2 border border-white rounded-full hover:bg-white hover:text-black transition-colors duration-300">
          访问作者博客
        </a>
      </div>
    </BaseModal>
  </header>
</template>

<script setup>
  import { ref } from 'vue';
  import { RouterLink } from 'vue-router';
  import { Info, User } from 'lucide-vue-next';

  const showModal = ref(false);

  function toggleModal() {
    showModal.value = !showModal.value;
  }
</script>
