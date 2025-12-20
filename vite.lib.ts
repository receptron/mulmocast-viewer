import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
      include: ['src/index.ts', 'src/components/**/*.ts', 'src/components/**/*.vue', 'src/lib/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/router/**', 'src/views/**'],
      staticImport: true,
      rollupTypes: true,
      copyDtsFiles: true,
      logLevel: 'silent',
    }),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MulmoCastViewer',
      fileName: (format) => `mulmocast-viewer.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
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
