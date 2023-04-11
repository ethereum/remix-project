export const selectStyles = {
  option: (baseStyles, state) => {
    return {
      ...baseStyles,
      color: state.isFocused ? 'var(--secondary)' : 'var(--text)',
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
    primary25: 'var(--primary)',
    primary: 'var(--primary)',
    primary50: 'var(--primary)',
    primary75: 'var(--primary)',
  },
})