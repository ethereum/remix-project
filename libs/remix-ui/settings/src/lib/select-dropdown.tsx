import React from 'react'
import { Registry } from "@remix-project/remix-lib"
import { CustomMenu, CustomToggle } from "@remix-ui/helper"
import { Dropdown } from "react-bootstrap"

type SelectDropdownProps = {
    value: string,
    options: {
      label: string,
      value: string
    }[],
    name: string,
    dispatch: React.Dispatch<{ type: string, payload: { name: string, value?: string } }>
  }

const SelectDropdown = ({ value, options, name, dispatch }: SelectDropdownProps) => {
  const handleChange = (name: string, value: string) => {
    dispatch({ type: 'SET_LOADING', payload: { name: name } })
    if (name === 'theme') {
      const themeModule = Registry.getInstance().get('themeModule').api
      const theme = themeModule.getThemes().find((theme) => theme.name === value)

      if (theme) {
        themeModule.switchTheme(theme.name)
        dispatch({ type: 'SET_VALUE', payload: { name: name, value: theme.name } })
      } else {
        console.error('Theme not found: ', value)
      }
    } else if (name === 'locale') {
      const localeModule = Registry.getInstance().get('localeModule').api
      const locale = localeModule.getLocales().find((locale) => locale.code === value)

      if (locale) {
        localeModule.switchLocale(locale.code)
        dispatch({ type: 'SET_VALUE', payload: { name: name, value: locale.code } })
      } else {
        console.error('Locale not found: ', value)
      }
    } else {
      dispatch({ type: 'SET_VALUE', payload: { name: name, value: value } })
    }
  }

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon="fas fa-caret-down" useDefaultIcon={false}>
        <div style={{ flexGrow: 1, overflow: 'hidden', display:'flex', justifyContent:'left' }}>
          <div className="text-truncate">
            {<span data-id="selectedVersion">{value}</span>}
          </div>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items overflow-hidden" data-id="custom-dropdown-items">
        {
          options.map((option) => (
            <Dropdown.Item key={option.value} onSelect={() => handleChange(name, option.value)}>
              <span>{option.label}</span>
            </Dropdown.Item>
          ))
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default SelectDropdown