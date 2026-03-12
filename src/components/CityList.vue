<template>
  <div v-for="city in savedCities" :key="city.id || city.adcode">
    <CityCard :city="city" @delete="handleDelete" @click="goToCityView(city)" />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  const gaodeKey = "REMOVED_GAODE_KEY";

  const savedCities = ref([]);
  const getCities = async () => {
    if (localStorage.getItem('savedCities')) {
      savedCities.value = JSON.parse(localStorage.getItem('savedCities'));
    }

    const requests = [];
    savedCities.value.forEach((city) => {
      requests.push(
        axios.get("https://restapi.amap.com/v3/weather/weatherInfo", {
          params: { key: gaodeKey, city: city.adcode, extensions: "base" },
        })
      );
    });

    const weatherData = await Promise.all(requests);

    weatherData.forEach((value, index) => {
      savedCities.value[index].weather = value.data;
    });
  };

  const handleDelete = (id) => {
    savedCities.value = savedCities.value.filter(city => city.id !== id);
  };

  await getCities();
  console.log(savedCities.value);

  const router = useRouter();
  const goToCityView = (city) => {
    // 之前你的 router.push params/name 不完全对，确保这些在 router 里面配置正确
    router.push({
      name: 'cityview', // HomeView 中的这里用的是全小写 cityview
      params: {
        province: city.province,
        city: city.city,
      },
    });
  }

</script>
