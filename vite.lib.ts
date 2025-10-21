import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'mulmoast-viewer',
      fileName: (format) => `mulmocast-viewer.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'pinia', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-i18n': 'VueI18n',
          pinia: 'Pinia',
          'vue-router': 'VueRouter'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'mulmocast-viewer.css'
          return assetInfo.name || 'asset'
        }
      }
    },
    cssCodeSplit: false
  }
})
