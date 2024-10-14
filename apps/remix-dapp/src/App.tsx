import React, { useEffect, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from './contexts';
import { appInitialState, appReducer } from './reducers/state';
import { initDispatch, initInstance, updateState } from './actions';
import enJson from './locales/en';
import zhJson from './locales/zh';
import esJson from './locales/es';
import frJson from './locales/fr';
import itJson from './locales/it';
import './App.css';
import { isMobile } from './utils/tools';
import MobilePage from './components/Home/mobile';
import PCPage from './components/Home/pc';

const localeMap: Record<string, any> = {
  zh: zhJson,
  en: enJson,
  fr: frJson,
  it: itJson,
  es: esJson,
};

function App(): JSX.Element {
  const [appState, dispatch] = useReducer(appReducer, appInitialState);
  const selectedLocaleCode = appState.settings.selectedLocaleCode;
  useEffect(() => {
    updateState(appState);
  }, [appState]);
  useEffect(() => {
    initDispatch(dispatch);
    updateState(appState);
    initInstance();
  }, []);

  return (
    <AppContext.Provider
      value={{
        dispatch,
        appState,
      }}
    >
      <IntlProvider
        locale={selectedLocaleCode}
        messages={localeMap[selectedLocaleCode]}
      >
        {isMobile() ? <MobilePage /> : <PCPage />}
        <ToastContainer
          position="bottom-right"
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </IntlProvider>
    </AppContext.Provider>
  );
}

export default App;
