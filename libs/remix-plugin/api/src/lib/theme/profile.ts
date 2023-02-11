import { ITheme } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const themeProfile: LibraryProfile<ITheme> = {
  name: 'theme',
  methods: ['currentTheme'],
  events: ['themeChanged']
}