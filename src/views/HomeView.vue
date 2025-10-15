<template>
  <div>
    <Viewers :dataSet="data" :basePath="basePath" />
  </div>
</template>

<script setup lang="ts">
import Viewers from '../components/viewer.vue';
import { sampleData } from './data';

const data = sampleData;
const basePath = '/google_dilemma';
</script>
