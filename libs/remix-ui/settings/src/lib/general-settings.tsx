import React from 'react'
import { SettingsSection } from '../types'
import { ToggleSwitch } from '@remix-ui/toggle'

type GeneralSettingsProps = {
  section: SettingsSection
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ section }) => (
  <>
    <h3 className="text-white py-3">{section.label}</h3>
    <span className="text-dark">{section.decription}</span>
    {section.subSections.map((subSection) => (
      <div key={subSection.title}>
        <h5 className="text-white pt-5">{subSection.title}</h5>
        <div className="card bg-dark text-light mb-4 border">
          <div className="card-body">
            {subSection.options.map((option, index) => (
              <div key={option.label}>
                <div className="d-flex align-items-center">
                  <h5 className="text-white m-0">
                    {option.label} {option.labelIcon && <i className={option.labelIcon}></i>}
                  </h5>
                  <div className="ml-auto">
                    <ToggleSwitch id={option.label} isOn={false} onClick={() => {}} />
                  </div>
                </div>
                {option.description && <span className="text-secondary mt-1">{option.description}</span>}
                {index !== subSection.options.length - 1 && <hr />}
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
    {/* <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Appearance</h5>
        <div className="form-row">
          <div className="d-flex w-100">
            <div className="form-group flex-fill mr-3">
              <label htmlFor="language">Language</label>
              <select className="form-control bg-secondary text-light" id="language" value={toggles.language} onChange={e => onSelect('language', e.target.value)}>
                <option>English</option>
              </select>
            </div>
            <div className="form-group flex-fill">
              <label htmlFor="theme">Theme</label>
              <select className="form-control bg-secondary text-light" id="theme" value={toggles.theme} onChange={e => onSelect('theme', e.target.value)}>
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div> */}
  </>
)