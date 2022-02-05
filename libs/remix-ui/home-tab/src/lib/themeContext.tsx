import React from 'react'

export const themes = {
  light: {
    filter: 'invert(0)',
    name: 'light'
  },
  dark: {
    filter: 'invert(1)',
    name: 'dark'
  }
}

export const ThemeContext = React.createContext(
  themes.dark // default value
)
