import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const themeMap: Record<string, any> = {
  Dark: { quality: 'dark', url: 'assets/css/themes/remix-dark_tvx1s2.css' },
  Light: { quality: 'light', url: 'assets/css/themes/remix-light_powaqg.css' },
  Violet: { quality: 'light', url: 'assets/css/themes/remix-violet.css' },
  Unicorn: { quality: 'light', url: 'assets/css/themes/remix-unicorn.css' },
  Midcentury: {
    quality: 'light',
    url: 'assets/css/themes/remix-midcentury_hrzph3.css',
  },
  Black: { quality: 'dark', url: 'assets/css/themes/remix-black_undtds.css' },
  Candy: { quality: 'light', url: 'assets/css/themes/remix-candy_ikhg4m.css' },
  HackerOwl: { quality: 'dark', url: 'assets/css/themes/remix-hacker_owl.css' },
  Cerulean: {
    quality: 'light',
    url: 'assets/css/themes/bootstrap-cerulean.min.css',
  },
  Flatly: {
    quality: 'light',
    url: 'assets/css/themes/bootstrap-flatly.min.css',
  },
  Spacelab: {
    quality: 'light',
    url: 'assets/css/themes/bootstrap-spacelab.min.css',
  },
  Cyborg: {
    quality: 'dark',
    url: 'assets/css/themes/bootstrap-cyborg.min.css',
  },
};

export function ThemeUI() {
  const [theme, setTheme] = useState(
    localStorage.getItem('selectedTheme') || 'Dark'
  );
  const themeList = Object.keys(themeMap);

  useEffect(() => {
    selectTheme(theme);
  }, []);

  const selectTheme = (selectedTheme: string) => {
    localStorage.setItem('selectedTheme', selectedTheme);
    setTheme(selectedTheme);

    const themeLinkEle = document.getElementById('theme-link');
    if (themeLinkEle) {
      themeLinkEle.remove();
    }
    const nextTheme = themeMap[selectedTheme]; // Theme
    document.documentElement.style.setProperty('--theme', nextTheme.quality);

    const theme = document.createElement('link');
    theme.setAttribute('rel', 'stylesheet');
    theme.setAttribute('href', 'https://remix.ethereum.org/' + nextTheme.url);
    theme.setAttribute('id', 'theme-link');

    document.head.insertBefore(theme, document.head.firstChild);
  };

  return (
    <div className="d-block mt-2">
      <label>
        <FormattedMessage id="udapp.themes" />
      </label>
      <div className="d-flex align-items-center">
        <select
          id="txorigin"
          data-id="runTabSelectAccount"
          name="txorigin"
          className="form-control overflow-hidden w-100 font-weight-normal custom-select pr-4"
          value={theme}
          onChange={(e) => {
            selectTheme(e.target.value);
          }}
        >
          {themeList.map((item) => (
            <option value={item} key={item}>
              {item} - {themeMap[item].quality}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
