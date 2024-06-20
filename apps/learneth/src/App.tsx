import React, { useEffect, useReducer, useState } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { IntlProvider } from 'react-intl'
import LoadingScreen from './components/LoadingScreen'
import LogoPage from './pages/Logo'
import HomePage from './pages/Home'
import StepListPage from './pages/StepList'
import StepDetailPage from './pages/StepDetail'
import { appInitialState, appReducer } from './reducers/state'
import { updateState, initDispatch, connectRemix, repoMap, loadRepo } from './actions'
import { AppContext } from './contexts'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import { RenderIf } from '@remix-ui/helper'
import { RemixClient } from './remix-client'

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

export const plugin = new RemixClient()

function App() {
  const [locale, setLocale] = useState<{ code: string; messages: any }>({
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

    plugin.internalEvents.on('learneth_activated', async () => {
      // @ts-ignore
      plugin.call('locale', 'currentLocale').then((locale: any) => {
        setLocale(locale)
      })
      // @ts-ignore
      plugin.on('locale', 'localeChanged', (locale: any) => {
        setLocale(locale)
        loadRepo(repoMap[locale.code] || repoMap.en)
      })

      await connectRemix()
    })
  }, [])
  return (
    <RenderIf condition={locale.messages}>
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
    </RenderIf>
  )
}

export default App
