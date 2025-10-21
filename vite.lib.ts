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
      entryRoot: 'src/index.ts',
      tsconfigPath: './tsconfig.app.json',
    }),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'mulmoast-viewer',
      fileName: (format) => `mulmocast-viewer.${format}.js`
    }
  }
})
