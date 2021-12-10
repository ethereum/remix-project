/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Theme, ThemeModule } from '../../types/theme-module';
import './remix-ui-theme-module.module.css';

/* eslint-disable-next-line */
export interface RemixUiThemeModuleProps {
  themeModule: ThemeModule;
}

const defaultThemes = [
  {
    name: 'Dark',
    quality: 'dark',
    url: 'assets/css/themes/remix-dark_tvx1s2.css'
  },
  {
    name: 'Light',
    quality: 'light',
    url: 'assets/css/themes/remix-light_powaqg.css'
  },
  {
    name: 'Midcentury',
    quality: 'light',
    url: 'assets/css/themes/remix-midcentury_hrzph3.css'
  },
  {
    name: 'Black',
    quality: 'dark',
    url: 'assets/css/themes/remix-black_undtds.css'
  },
  {
    name: 'Candy',
    quality: 'light',
    url: 'assets/css/themes/remix-candy_ikhg4m.css'
  },

  {
    name: 'Cerulean',
    quality: 'light',
    url: 'assets/css/themes/bootstrap-cerulean.min.css'
  },
  {
    name: 'Flatly',
    quality: 'light',
    url: 'assets/css/themes/bootstrap-flatly.min.css'
  },
  {
    name: 'Spacelab',
    quality: 'light',
    url: 'assets/css/themes/bootstrap-spacelab.min.css'
  },
  {
    name: 'Cyborg',
    quality: 'dark',
    url: 'assets/css/themes/bootstrap-cyborg.min.css'
  }
];

export function RemixUiThemeModule({ themeModule }: RemixUiThemeModuleProps) {
  const [themeName, setThemeName] = useState('');
  const [themes, _] = useState<Theme[]>(defaultThemes);
  const themeRef = useRef<any>(null);

  useEffect(() => {
      themeModule.switchTheme()
  }, [themeName, themeModule]);

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
                    checked={themeModule.active === theme.name}
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
  );
}

export default RemixUiThemeModule;
