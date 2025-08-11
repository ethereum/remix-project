import React, { useEffect, useState } from 'react'
import { SettingsActions, SettingsSection, SettingsState } from '../types'
import { ToggleSwitch } from '@remix-ui/toggle'
import { useIntl } from 'react-intl'
import SelectDropdown from './select-dropdown'

type SettingsSectionUIProps = {
  section: SettingsSection,
  state: SettingsState,
  dispatch: React.Dispatch<SettingsActions>
}

export const SettingsSectionUI: React.FC<SettingsSectionUIProps> = ({ section, state, dispatch }) => {
  const [formUIData, setFormUIData] = useState<{ [key in keyof SettingsState]: Record<keyof SettingsState, string> }>({} as any)
  const intl = useIntl()

  useEffect(() => {
    if (section) {
      (section.subSections || []).forEach((subSection) => {
        (subSection.options || []).forEach((option) => {
          if (option.type === 'toggle' && option.toggleUIOptions) {
            option.toggleUIOptions.forEach((toggleOption) => {
              handleFormUIData(option.name, toggleOption.name, state[toggleOption.name].value as string)
            })
          }
        })
      })
    }
  }, [section])

  const handleToggle = (name: string) => {
    if (state[name]) {
      const newValue = !state[name].value

      dispatch({ type: 'SET_LOADING', payload: { name: name } })
      dispatch({ type: 'SET_VALUE', payload: { name: name, value: newValue } })
      if (!newValue && formUIData[name]) {
        Object.keys(formUIData[name]).forEach((key) => {
          dispatch({ type: 'SET_VALUE', payload: { name: key, value: '' } })
        })
        dispatch({ type: 'SET_TOAST_MESSAGE', payload: { value: 'Credentials removed' } })
      }
    } else {
      console.error('Setting does not exist: ', name)
    }
  }

  const handleFormUIData = (optionName: keyof SettingsState, toggleOptionName: keyof SettingsState, value: string) => {
    setFormUIData({ ...formUIData, [optionName]: { ...formUIData[optionName], [toggleOptionName]: value } })
  }

  const saveFormUIData = (optionName: keyof SettingsState) => {
    Object.keys(formUIData[optionName]).forEach((key) => {
      dispatch({ type: 'SET_VALUE', payload: { name: key, value: formUIData[optionName][key] } })
    })
    dispatch({ type: 'SET_TOAST_MESSAGE', payload: { value: 'Credentials updated' } })
  }

  return (
    <>
      <h3 className="text-white py-3">{section.label}</h3>
      <span className="text-dark">{section.decription}</span>
      {(section.subSections || []).map((subSection, subSectionIndex) => {
        const isLastItem = subSectionIndex === section.subSections.length - 1

        return (
          <div key={subSectionIndex} className='pt-5'>
            {subSection.title && <h5 className="text-white">{subSection.title}</h5>}
            <div className={`card text-light border ${isLastItem ? 'mb-4' : ''}`}>
              <div className="card-body">
                {subSection.options.map((option, optionIndex) => {
                  const isFirstOption = optionIndex === 0
                  const isLastOption = optionIndex === subSection.options.length - 1
                  const toggleValue = state[option.name] && typeof state[option.name].value === 'boolean' ? state[option.name].value as boolean : false
                  const selectValue = state[option.name] && typeof state[option.name].value === 'string' ? state[option.name].value as string : ''

                  return (
                    <div className={`card ${isLastOption ? 'pt-3 pb-0' : isFirstOption ? 'border-bottom pb-3' : 'border-bottom py-3'}`} key={optionIndex}>
                      <div className="d-flex align-items-center">
                        <h5 className="text-white m-0">
                          {option.label} {option.labelIcon && <i className={option.labelIcon}></i>}
                        </h5>
                        <div className="ml-auto">
                          {option.type === 'toggle' && <ToggleSwitch id={option.name} isOn={toggleValue} onClick={() => handleToggle(option.name)} />}
                          {option.type === 'select' && <div style={{ minWidth: '100px' }}><SelectDropdown value={selectValue} options={option.selectOptions} name={option.name} dispatch={dispatch as any} /></div>}
                          {option.type === 'button' && <button className="btn btn-secondary btn-sm">{option.label}</button>}
                        </div>
                      </div>
                      {option.description && <span className="text-secondary mt-1">{option.description}</span>}
                      {
                        option.footnote ? option.footnote.link ?
                          <a href={option.footnote.link} className={`mt-1 ${option.footnote.styleClass}`} target="_blank" rel="noopener noreferrer">{option.footnote.text}</a>
                          :
                          <span className={`text-secondary mt-1 ${option.footnote.styleClass}`}>{option.footnote.text}</span>
                          : null
                      }
                      {option.toggleUIDescription && toggleValue && <span className="text-secondary mt-1">{option.toggleUIDescription}</span>}
                      {option.toggleUIOptions && toggleValue && option.toggleUIOptions.map((toggleOption, toggleOptionIndex) => {
                        const isLastOption = toggleOptionIndex === option.toggleUIOptions.length - 1
                        const inputValue = state[toggleOption.name] && typeof state[toggleOption.name].value === 'string' ? state[toggleOption.name].value as string : ''

                        return state[toggleOption.name] && (
                          <div key={toggleOptionIndex}>
                            <div className={`text-secondary ${isLastOption ? 'mt-2 mb-0' : 'my-2'}`}>
                              <input
                                name={toggleOption.name}
                                data-id={`settingsTab${toggleOption.name}`}
                                type={toggleOption.type}
                                className="form-control"
                                onChange={(e) => handleFormUIData(option.name, toggleOption.name, e.target.value)}
                                defaultValue={inputValue}
                                placeholder={intl.formatMessage({ id: `settings.${toggleOption.name}` })}
                              />
                            </div>
                            {isLastOption && <div className="d-flex pt-3">
                              <input
                                className="btn btn-sm btn-primary"
                                id={`settingsTabSave${option.name}`}
                                data-id={`settingsTabSave${option.name}`}
                                onClick={() => saveFormUIData(option.name)}
                                value={intl.formatMessage({ id: 'settings.save' })}
                                type="button"
                                // disabled={!formUIData[option.name]}
                              ></input>
                            </div>
                            }
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )})}
    </>
  )
}