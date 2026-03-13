<template>
  <div class="flex flex-col flex-1 pb-32 animate-pulse">
    <div class="container relative z-10 pt-24">
      <div class="h-20 md:h-24 w-3/4 md:w-1/2 bg-brand-primary/10 mb-12"></div>

      <div
        class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start border-t-2 border-brand-primary/10 pt-12">
        <div class="col-span-1 md:col-span-3 gap-4 flex flex-col">
          <div class="h-10 w-48 bg-brand-primary/10 mb-4"></div>
          <div class="h-4 w-32 bg-brand-primary/5"></div>
          <div class="h-4 w-40 bg-brand-primary/5"></div>
          <div class="h-4 w-36 bg-brand-primary/5"></div>
        </div>

        <div class="col-span-1 md:col-span-6 flex justify-start md:justify-end md:pr-16">
          <div class="h-32 w-32 md:h-48 md:w-48 bg-brand-primary/10 rounded-full"></div>
        </div>

        <div class="col-span-1 md:col-span-3 flex flex-col justify-end h-full mt-12 md:mt-0">
          <div class="h-4 w-24 bg-brand-primary/10 mb-2"></div>
          <div class="h-6 w-32 bg-brand-primary/5 mb-2"></div>
          <div class="h-4 w-40 bg-brand-primary/5"></div>
        </div>
      </div>
    </div>

    <!-- Forecast Skeleton -->
    <div class="container mt-32">
      <div class="w-full flex items-center justify-between border-b-2 border-brand-primary pb-6 mb-12">
        <div class="h-8 w-64 bg-brand-primary/10"></div>
        <div class="h-4 w-32 bg-brand-primary/5 hidden md:block"></div>
      </div>

      <div class="flex flex-col w-full">
        <div v-for="i in 4" :key="i"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center py-8 md:py-10 border-b border-brand-primary/10 px-4 md:px-8 -mx-4 md:-mx-8">
          <div class="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col gap-2">
            <div class="h-6 w-32 bg-brand-primary/10"></div>
            <div class="h-3 w-16 bg-brand-primary/5"></div>
          </div>
          <div class="col-span-1 flex flex-col gap-2">
            <div class="h-6 w-24 bg-brand-primary/10"></div>
            <div class="h-3 w-16 bg-brand-primary/5"></div>
          </div>
          <div class="col-span-1 flex flex-col gap-2">
            <div class="h-6 w-24 bg-brand-primary/10"></div>
            <div class="h-3 w-16 bg-brand-primary/5"></div>
          </div>
          <div class="col-span-1 flex justify-end">
            <div class="h-10 w-24 bg-brand-primary/10"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
