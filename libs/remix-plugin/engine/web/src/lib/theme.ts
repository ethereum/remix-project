import { Plugin } from '@remixproject/engine'
import { MethodApi } from '@remixproject/plugin-utils'
import { ITheme, Theme, themeProfile } from '@remixproject/plugin-api'

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Utils function to create a theme with default value
 * Default values are taken from material design with colors 
 * - primary: indigo
 * - secondary: pink
 * - warn: orange
 * - error: red
 */
export function createTheme(params: DeepPartial<Theme> = {}): Theme {
  return {
    brightness: 'light',
    fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
    space: 8,
    ...params,
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 1024,
      lg: 1440,
      xl: 1920,
      ...params.breakpoints
    },
    colors: {
      surface: 'white',
      background: '#fafafa',  // light grey
      foreground: 'black',
      primary: '#3f51b5', // indigo
      primaryContrast: 'white',
      secondary: '#e91e63',  // pink
      secondaryContrast: 'rgba(white, 0.7)',
      success: '#4caf50',  // green
      successContrast: 'rgba(black, 0.87)',
      warn: '#ff9800',  // orange
      warnContrast: 'white',
      error: '#f44336', // red
      errorContrast: 'white',
      disabled: 'rgba(0,0,0,.26)',
      ...params.colors
    },
  }
}

export class ThemePlugin extends Plugin implements MethodApi<ITheme> {
  protected getTheme = createTheme
  protected theme: Theme
  constructor() {
    super(themeProfile)
    this.theme = this.getTheme()
  }

  /** Internal API to set the current theme */
  setTheme(theme: DeepPartial<Theme>) {
    this.theme = this.getTheme(theme)
    this.emit('themeChanged', this.theme)
  }

  /** External API to get the current theme */
  async currentTheme(): Promise<Theme> {
    return this.theme
  }

}