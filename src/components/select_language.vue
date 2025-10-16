<template>
<select
  :value="modelValue"
  @change="handleLanguageChange"
  >
  <option v-for="(v, k) in languages" >
    {{ v }}
  </option>
</select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const languages = ["en", "ja"];

interface Props {
  modelValue: string;
}
defineProps<Props>();
                   
const emit = defineEmits(['update:modelValue']);

const handleLanguageChange = (event: string) => {
  emit('update:modelValue', event.target.value);
};
</script>
