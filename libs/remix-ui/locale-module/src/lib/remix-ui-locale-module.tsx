import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl'
import { LocaleModule } from '../../types/locale-module';
import './remix-ui-locale-module.module.css';

export interface RemixUiLocaleModuleProps {
  localeModule: LocaleModule;
}

export function RemixUiLocaleModule({ localeModule }: RemixUiLocaleModuleProps) {
  const [localeName, setLocaleName] = useState('')

  useEffect(() => {
      localeModule.switchLocale()
  }, [localeName, localeModule])

  return (
    <div className="border-top mb-4">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id='settings.locales' defaultMessage='Lanaguage' />
        </h6>
        <div className="card-text locales-container">
          {localeModule.getLocales()
            ? localeModule.getLocales().map((locale, idx) => (
                <div
                  className="radio custom-control custom-radio mb-1 form-check"
                  key={idx}
                >
                  <input
                    type="radio"
                    onChange={event => {
                      localeModule.switchLocale(locale.name);
                      setLocaleName(locale.name);
                    }}
                    className="align-middle custom-control-input"
                    name="locale"
                    id={locale.name}
                    data-id={`settingsTabLocale${locale.name}`}
                    checked={localeModule.active === locale.name.toLocaleLowerCase()}
                  />
                  <label
                    className="form-check-label custom-control-label"
                    data-id={`settingsTabLocaleLabel${locale.name}`}
                    htmlFor={locale.name}
                  >
                    {locale.name}
                  </label>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  )
}

export default RemixUiLocaleModule;
