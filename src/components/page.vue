<template>
  <div>
    {{ data.imagePath }}
    <img :src="`${basePath}/${data.imagePath}`" >
    <audio :src="`${basePath}/${data.audio}`" :controls="true" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: unknown;
  basePath: string;
  index: number;
}
const props = defineProps<Props>();
</script>
