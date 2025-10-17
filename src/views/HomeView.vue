<template>
  <div class="p-10">
    <template v-for="v in data.files" :key="v">
      <li><router-link :to="`/contents/${v}/0`">{{ v }}</router-link></li>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { data } from "./data";
  console.log(data);
</script>
