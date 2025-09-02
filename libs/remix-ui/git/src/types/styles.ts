import { StylesConfig } from 'react-select'
export const selectStyles: StylesConfig = {
  option: (baseStyles, state) => {
    return {
      ...baseStyles,
      color: 'var(--bs-body-color)',
    }
  },
  input(base, props) {
    return {
      ...base,
      color: 'var(--bs-body-color)',
    }
  },
  singleValue: (baseStyles, state) => {
    return {
      ...baseStyles,
      color: 'var(--bs-body-color)',
    }
  },
  control: (baseStyles, state) => ({
    ...baseStyles,
    color: 'var(--bs-body-color)',
    backgroundColor: 'var(--custom-onsurface-layer-2)',
    border: 'none',
  }),
  menu: (baseStyles, state) => {
    return {
      ...baseStyles,
      backgroundColor: 'var(--custom-onsurface-layer-2)',
      color: 'var(--bs-body-color)',
    }
  },
  menuList: (baseStyles, props) => {
    return {
      ...baseStyles,
      backgroundColor: 'var(--custom-onsurface-layer-2)',
      color: 'var(--bs-body-color)',
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