import { Plugin } from '@remixproject/engine'
import { API, PluginOptions } from '@remixproject/plugin-utils'
import { ITheme, Theme, ThemeUrls, themeProfile } from '@remixproject/plugin-api'
import { window, ColorThemeKind, Disposable, ColorTheme } from 'vscode'

export interface ThemeOptions extends PluginOptions {
  urls?: Partial<ThemeUrls>
}

// There is no way to get the value from the theme so the best solution is to reference the css varibles in webview
export function getVscodeTheme(color: ColorTheme, urls: Partial<ThemeUrls> = {}): Theme {
  const brightness = color.kind === ColorThemeKind.Dark ? 'dark' : 'light';
  return {
    brightness,
    colors: {
      surface: 'var(--vscode-tab-inactiveBackground)',
      background: 'var(--vscode-sidebar-background)',
      foreground: 'var(--vscode-sideBar-foreground)',
      primary: 'var(--vscode-button-background)',
      primaryContrast: 'var(--vscode-button-foreground)',
      secondary: 'var(--vscode-button-secondaryBackground)',
      secondaryContrast: 'var(--vscode-button-secondaryForeground)',
      success: 'var(--vscode-button-background)', // Same as primary: no success color in vscode
      successContrast: 'var(--vscode-button-foreground)',
      warn: 'var(--vscode-inputValidation-warningBackground)',
      warnContrast: 'var(--vscode-inputValidation-warningForeground)',
      error: 'var(--vscode-inputValidation-errorBackground)',
      errorContrast: 'var(--vscode-inputValidation-errorForeground)',
      disabled: 'var(--vscode-debugIcon-breakpointDisabledForeground)',
    },
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 1024,
      lg: 1440,
      xl: 1920
    },
    fontFamily: 'Segoe WPC,Segoe UI,sans-serif',
    space: 1,
    url: urls[brightness]
  }
}

export class ThemePlugin extends Plugin implements API<ITheme> {
  protected getTheme = getVscodeTheme;
  protected options: ThemeOptions
  listener: Disposable
  constructor(options: Partial<ThemeOptions> = {}) {
    super(themeProfile)
    super.setOptions(options)
  }

  setOptions(options: Partial<ThemeOptions>) {
    super.setOptions(options)
  }

  onActivation() {
    this.listener = window.onDidChangeActiveColorTheme(color => {
      this.emit('themeChanged', this.getTheme(color, this.options.urls))
    })
  }

  onDeactivation() {
    this.listener.dispose()
  }

  currentTheme(): Theme {
    return this.getTheme(window.activeColorTheme, this.options.urls)
  }

}

