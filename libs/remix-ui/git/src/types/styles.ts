import { StylesConfig } from 'react-select'
export const selectStyles: StylesConfig = {
  option: (baseStyles, state) => {
    return {
      ...baseStyles,
      color: 'var(--text)',
    }
  },
  input(base, props) {
    return {
      ...base,
      color: 'var(--text)',
    }
  },
  singleValue: (baseStyles, state) => {
    return {
      ...baseStyles,
      color: 'var(--text)',
    }
  },
  control: (baseStyles, state) => ({
    ...baseStyles,
    color: 'var(--text)',
    backgroundColor: 'var(--custom-select)',
    border: 'none',
  }),
  menu: (baseStyles, state) => {
    return {
      ...baseStyles,
      backgroundColor: 'var(--custom-select)',
      color: 'var(--text)',
    }
  },
  menuList: (baseStyles, props) => {
    return {
      ...baseStyles,
      backgroundColor: 'var(--custom-select)',
      color: 'var(--text)',
    }
  },
}

export const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: 'var(--bs-primary)',
    primary: 'var(--bs-primary)',
    primary50: 'var(--bs-primary)',
    primary75: 'var(--bs-primary)',
  },
})