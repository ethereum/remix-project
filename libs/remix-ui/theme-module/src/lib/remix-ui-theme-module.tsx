/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { ThemeModule } from '../../types/theme-module';
import './remix-ui-theme-module.module.css';

/* eslint-disable-next-line */
export interface RemixUiThemeModuleProps {
  themeModule: ThemeModule;
}

export function RemixUiThemeModule({ themeModule }: RemixUiThemeModuleProps) {
  const [themeName, setThemeName] = useState('')

  useEffect(() => {
      themeModule.switchTheme()
  }, [themeName, themeModule])

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">Themes</h6>
        <div className="card-text themes-container">
          {themeModule.getThemes()
            ? themeModule.getThemes().map((theme, idx) => (
                <div
                  className="radio custom-control custom-radio mb-1 form-check"
                  key={idx}
                >
                  <input
                    type="radio"
                    onChange={event => {
                      themeModule.switchTheme(theme.name);
                      setThemeName(theme.name);
                    }}
                    className="align-middle custom-control-input"
                    name="theme"
                    id={theme.name}
                    data-id={`settingsTabTheme${theme.name}`}
                    checked={themeModule.active === theme.name.toLocaleLowerCase()}
                  />
                  <label
                    className="form-check-label custom-control-label"
                    data-id={`settingsTabThemeLabel${theme.name}`}
                    htmlFor={theme.name}
                  >
                    {theme.name} ({theme.quality})
                  </label>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  )
}

export default RemixUiThemeModule;
