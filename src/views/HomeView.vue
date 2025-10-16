<template>
  <div>
    <Viewers :data-set="data" :base-path="basePath" />
  </div>
</template>

<script setup lang="ts">
import Viewers from '../components/viewer.vue';
import { sampleData } from './data';

const data = sampleData;
const basePath = '/test_media';
</script>
