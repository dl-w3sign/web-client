import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import fs from 'fs'
import path from 'path'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relative: string) => path.resolve(appDirectory, relative)
const root = path.resolve(__dirname, resolveApp('src'))

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = env.VITE_APP_ENVIRONMENT === 'production'
  const isDevelopment = env.VITE_APP_ENVIRONMENT === 'development'
  const isAnalyze = env.VITE_APP_ENVIRONMENT === 'analyze'
  const buildVersion = env.VITE_APP_BUILD_VERSION

  return {
    server: {
      port: Number(env.VITE_PORT),
    },
    publicDir: 'static',
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: '[name]',
      }),
      checker({
        overlay: {
          initialIsOpen: false,
        },
        typescript: true,
        eslint: {
          lintCommand:
            'eslint "{src,config}/**/*.{vue,js,ts}" --cache --max-warnings=0',
        },
      }),
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
            }),
          ]
        : []),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "@/styles/_functions.scss";
          @import "@/styles/_mixins.scss";
        `,
        },
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      dedupe: ['vue'],
      alias: {
        '@': `${root}/`,
        '@config': `${root}/config.ts`,
        '@static': `${root}/../static`,
      },
    },
  }
})
