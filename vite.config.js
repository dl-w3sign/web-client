import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relative => path.resolve(appDirectory, relative)
const root = path.resolve(__dirname, resolveApp('src'))

export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
    },
    port: 8095,
  },
  resolve: {
    alias: {
      '@': `${root}/`,
    },
  },
})
