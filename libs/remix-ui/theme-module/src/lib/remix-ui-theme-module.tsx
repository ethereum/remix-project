import React from 'react'
import { ThemeModule } from '../../types/theme-module'
import './remix-ui-theme-module.module.css'

/* eslint-disable-next-line */
export interface RemixUiThemeModuleProps {
  themeModule: ThemeModule
}

export function RemixUiThemeModule({ themeModule }: RemixUiThemeModuleProps) {
  const themes = () => {
    const themes = themeModule.getThemes()
    if (themes) {
      return themes.map((aTheme, index) => (
        <div className="radio custom-control custom-radio mb-1 form-check" key={index}>
          <input type="radio" onChange={event => { themeModule.switchTheme(aTheme.name) }} className="align-middle custom-control-input" name='theme' id={aTheme.name} data-id={`settingsTabTheme${aTheme.name}`} checked = {themeModule.active === aTheme.name }/>
          <label className="form-check-label custom-control-label" data-id={`settingsTabThemeLabel${aTheme.name}`} htmlFor={aTheme.name}>{aTheme.name} ({aTheme.quality})</label>
        </div>
      )
      )
    }
    return
  }
  return (
    <div className="border-top">
        <div className="card-body pt-3 pb-2">
          <h6 className="card-title">Themes Module</h6>
          <div className="card-text themes-container">
            <h1>Welcome to remix-ui-theme-module!</h1>
          </div>
        </div>
      </div>
  )
}

export default RemixUiThemeModule;
