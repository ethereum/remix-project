import { useContext, useEffect } from 'react';
import { AppContext } from '../../contexts';

const localeMap: Record<string, string> = {
  zh: 'Chinese Simplified - 简体中文',
  en: 'English - English',
  fr: 'French - Français',
  it: 'Italian - Italiano',
  es: 'Spanish - Español',
};

export function LocaleUI() {
  const { appState, dispatch } = useContext(AppContext);
  const { selectedLocaleCode } = appState.settings;
  const localeCodeList = Object.keys(localeMap);

  useEffect(() => {
    const defaultLocaleCode =
      localStorage.getItem('selectedLocaleCode') || 'en';
    setLocaleCode(defaultLocaleCode);
  }, []);

  const setLocaleCode = (localeCode: string) => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: { selectedLocaleCode: localeCode },
    });
    localStorage.setItem('selectedLocaleCode', localeCode);
  };

  return (
    <div className="d-block">
      <div className="d-flex align-items-center">
        <select
          id="txorigin"
          data-id="localeSelectOptions"
          name="txorigin"
          className="form-control overflow-hidden w-100 font-weight-normal custom-select pr-4"
          value={selectedLocaleCode || localeCodeList[0]}
          onChange={(e) => {
            setLocaleCode(e.target.value);
          }}
        >
          {localeCodeList.map((localeCode) => (
            <option value={localeCode} key={localeCode} data-id={`localeOption${localeCode}`}>
              {localeCode.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
