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
    themeModule.switchTheme();
  }, [themeName, themeModule]);
  /**
   * Change the current theme
   * @param {string} [themeName] - The name of the theme
   */
  function switchTheme(themeName: string) {
    if (themeName && !Object.keys(themes).includes(themeName)) {
      throw new Error(`Theme ${themeName} doesn't exist`);
    }
    const next = themeName || this.active; // Name
    if (next === this.active) return;
    themeModule._paq.push(['trackEvent', 'themeModule', 'switchTo', next]);
    const nextTheme = themeModule.themes[next]; // Theme
    if (!themeModule.forced)
      themeModule._deps.config.set('settings/theme', next);
    document.getElementById('theme-link').remove();
    const theme = yo`<link rel="stylesheet" href="${nextTheme.url}" id="theme-link"/>`;
    theme.addEventListener('load', () => {
      themeModule.emit('themeLoaded', nextTheme);
      themeModule.events.emit('themeLoaded', nextTheme);
    });
    document.head.insertBefore(theme, document.head.firstChild);
    document.documentElement.style.setProperty('--theme', nextTheme.quality);
    if (themeName) themeModule.active = themeName;
    // TODO: Only keep `this.emit` (issue#2210)
    themeModule.emit('themeChanged', nextTheme);
    themeModule.events.emit('themeChanged', nextTheme);
  }

  function ThemeHead() {
    const [nextTheme, setNextTheme] = useState<any>();
    const linkRef = useRef<any>(null);
    useEffect(() => {
      const shell = document.querySelector('div[data-id="remixIDE"]') as any;
      const splashScreen = document.querySelector(
        'div[data-id="remixIDESplash"]'
      ) as Node;
      const callback = () => {
        // setTimeout(() => {
        //   document.body.removeChild(splashScreen)
        //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //   shell!.style.visibility = 'visible'
        // }, 1500)
      };
      document.addEventListener('load', () => {
        if (callback) callback();
      });
      document.head.insertBefore(linkRef.current, document.head.firstChild);
    }, []);

    return (
      <link
        rel="stylesheet"
        href={nextTheme.url}
        ref={linkRef}
        id="theme-link"
      />
    );
  }

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
