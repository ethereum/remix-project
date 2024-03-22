import React, {useEffect, useReducer, useState} from 'react'
import {createHashRouter, RouterProvider} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import {IntlProvider} from 'react-intl'
import LoadingScreen from './components/LoadingScreen'
import LogoPage from './pages/Logo'
import HomePage from './pages/Home'
import StepListPage from './pages/StepList'
import StepDetailPage from './pages/StepDetail'
import {appInitialState, appReducer} from './reducers/state'
import {updateState, initDispatch, connectRemix, repoMap, loadRepo} from './actions'
import {AppContext} from './contexts'
import remixClient from './remix-client'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

export const router = createHashRouter([
  {
    path: '/',
    element: <LogoPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/list',
    element: <StepListPage />,
  },
  {
    path: '/detail',
    element: <StepDetailPage />,
  },
])

function App(): JSX.Element {
  const [locale, setLocale] = useState<{code: string; messages: any}>({
    code: 'en',
    messages: null,
  })
  const [appState, dispatch] = useReducer(appReducer, appInitialState)
  useEffect(() => {
    updateState(appState)
  }, [appState])
  useEffect(() => {
    initDispatch(dispatch)
    updateState(appState)
    connectRemix().then(() => {
      // @ts-ignore
      remixClient.call('locale', 'currentLocale').then((locale: any) => {
        setLocale(locale)
      })
      // @ts-ignore
      remixClient.on('locale', 'localeChanged', (locale: any) => {
        setLocale(locale)
        loadRepo(repoMap[locale.code] || repoMap.en)
      })
    })
  }, [])
  return (
    <AppContext.Provider
      value={{
        dispatch,
        appState,
        localeCode: locale.code,
      }}
    >
      <IntlProvider locale={locale.code} messages={locale.messages}>
        <RouterProvider router={router} />
        <LoadingScreen />
        <ToastContainer position="bottom-right" newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover autoClose={false} theme="colored" />
      </IntlProvider>
    </AppContext.Provider>
  )
}

export default App
