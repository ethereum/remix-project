import React, { useEffect, useReducer } from 'react';
import CreateInstance from './components/CreateInstance';
import EditInstance from './components/EditInstance';
import DeployPanel from './components/DeployPanel';
import LoadingScreen from './components/LoadingScreen';
import { appInitialState, appReducer } from './reducers/state';
import {
  connectRemix,
  initDispatch,
  updateState,
  selectTheme,
} from './actions';
import { AppContext } from './contexts';
import remixClient from './remix-client';
import './App.css';

function App(): JSX.Element {
  const [appState, dispatch] = useReducer(appReducer, appInitialState);
  useEffect(() => {
    updateState(appState);
  }, [appState]);
  useEffect(() => {
    initDispatch(dispatch);
    updateState(appState);
    connectRemix().then(() => {
      remixClient.call('theme', 'currentTheme').then((theme: any) => {
        selectTheme(theme.name);
      });
      remixClient.on('theme', 'themeChanged', (theme: any) => {
        selectTheme(theme.name);
      });
    });
  }, []);
  return (
    <AppContext.Provider
      value={{
        dispatch,
        appState,
      }}
    >
      {Object.keys(appState.instance.abi).length > 0 ? (
        <div className="row m-0 pt-3">
          <EditInstance />
          <DeployPanel />
        </div>
      ) : (
        <div className="row m-0 pt-3">
          <CreateInstance />
        </div>
      )}
      <LoadingScreen />
    </AppContext.Provider>
  );
}

export default App;
