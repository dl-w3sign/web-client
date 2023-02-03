import { getCurrentInstance } from 'vue'
import { VueI18nTranslation } from 'vue-i18n'
import { config } from '@config'
import { ICON_NAMES, ROUTE_NAMES } from '@/enums'

export const useContext = (): {
  $t: VueI18nTranslation
  $config: typeof config
  $routes: typeof ROUTE_NAMES
  $icons: typeof ICON_NAMES
} => {
  const app = getCurrentInstance()
  if (!app) throw new Error('app is null')

  const { $t, $config, $routes, $icons } =
    app.appContext.config.globalProperties

  return {
    $t,
    $config,
    $routes,
    $icons,
  }
}
