import React from 'react'
import { SettingsSection } from '../types'
import { ToggleSwitch } from '@remix-ui/toggle'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle } from '@remix-ui/helper'

type SettingsSectionUIProps = {
  section: SettingsSection
}

type SelectDropdownProps = {
  value: string,
  options: {
    label: string,
    value: string
  }[],
}

const SelectDropdown = ({ value, options }: SelectDropdownProps) => {
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
            <Dropdown.Item key={option.value}>
              <span>{option.label}</span>
            </Dropdown.Item>
          ))
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

export const SettingsSectionUI: React.FC<SettingsSectionUIProps> = ({ section }) => (
  <>
    <h3 className="text-white py-3">{section.label}</h3>
    <span className="text-dark">{section.decription}</span>
    {section.subSections.map((subSection, subSectionIndex) => {
      const isLastItem = subSectionIndex === section.subSections.length - 1

      return (
        <div key={subSection.title} className='pt-5'>
          {subSection.title && <h5 className="text-white">{subSection.title}</h5>}
          <div className={`card text-light border ${isLastItem ? 'mb-4' : ''}`}>
            <div className="card-body">
              {subSection.options.map((option, optionIndex) => {
                const isFirstOption = optionIndex === 0
                const isLastOption = optionIndex === subSection.options.length - 1

                return (
                  <div className={`card ${isFirstOption ? 'border-bottom pt-0 pb-3' : isLastOption ? 'pt-3 pb-0' : 'border-bottom py-3'}`} key={optionIndex}>
                    <div className="d-flex align-items-center">
                      <h5 className="text-white m-0">
                        {option.label} {option.labelIcon && <i className={option.labelIcon}></i>}
                      </h5>
                      <div className="ml-auto">
                        {option.type === 'toggle' && <ToggleSwitch id={option.label} isOn={false} onClick={() => {}} />}
                        {option.type === 'select' && <div style={{ minWidth: '100px' }}><SelectDropdown value={option.selectOptions[0].value} options={option.selectOptions} /></div>}
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
                    {option.toggleOptions && option.toggleOptions}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )})}
  </>
)