<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-show="show" class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">

        <!-- Backdrop -->
        <div class="absolute inset-0 bg-surface/90 backdrop-blur-xl" @click="closeModal"></div>

        <!-- Modal Content -->
        <Transition name="modal-slide" appear>
          <div v-show="show"
            class="relative w-full max-w-2xl bg-brand-accent/96 text-surface-text p-8 md:p-16 shadow-2xl shadow-black/50 border border-brand-primary/10 mx-4 overflow-hidden rounded-[2rem]">
            <!-- Decorative Accent line -->
            <div class="absolute top-0 left-0 w-full h-[2px] bg-brand-primary/20"></div>

            <slot></slot>

            <button @click="closeModal"
              aria-label="Close dialog / 关闭弹窗"
              class="group mt-12 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] overflow-hidden">
              <span class="group-hover:-translate-y-full absolute transition-transform duration-500">Close / 关闭</span>
              <span class="group-hover:translate-y-0 translate-y-full transition-transform duration-500">Close / 关闭</span>
              <!-- Layout push space -->
              <span class="opacity-0">Close / 关闭</span>

              <div class="w-8 h-[2px] bg-brand-primary group-hover:w-16 transition-all duration-500"></div>
            </button>
          </div>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  defineProps({
    show: Boolean,
  });

  const emit = defineEmits(["close-modal"]);

  function closeModal() {
    emit("close-modal");
  }
</script>

<style scoped>

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-slide-enter-active {
    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
  }

  .modal-slide-leave-active {
    transition: all 0.5s cubic-bezier(0.7, 0, 0.84, 0);
  }

  .modal-slide-enter-from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }

  .modal-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
</style>
