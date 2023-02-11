import { PluginClient, PluginOptions } from '@remixproject/plugin'
import { Theme } from "@remixproject/plugin-api"

/** Start listening on theme changed */
export async function listenOnThemeChanged(client: PluginClient, options?: Partial<PluginOptions<any>>) {
  if (options && options.customTheme) return
  const cssLink = document.createElement('link')
  cssLink.setAttribute('rel', 'stylesheet')
  document.head.prepend(cssLink)
  client.onload(async () => {
    client.on('theme', 'themeChanged', (_theme: Theme) => setTheme(cssLink, _theme))
    const theme = await client.call('theme', 'currentTheme')
    setTheme(cssLink, theme)
  })
  return cssLink
}


function setTheme(cssLink: HTMLLinkElement, theme: Theme) {
  cssLink.setAttribute('href', theme.url.replace(/^http:/,"").replace(/^https:/,""))
  document.documentElement.style.setProperty('--theme', theme.quality)
}
