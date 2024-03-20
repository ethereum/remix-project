import React, {useEffect, useReducer} from 'react'
import {createHashRouter, RouterProvider} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import LoadingScreen from './components/LoadingScreen'
import LogoPage from './pages/Logo'
import HomePage from './pages/Home'
import StepListPage from './pages/StepList'
import StepDetailPage from './pages/StepDetail'
import {appInitialState, appReducer} from './reducers/state'
import {updateState, initDispatch, connectRemix} from './actions'
import {AppContext} from './contexts'
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
  const [appState, dispatch] = useReducer(appReducer, appInitialState)
  useEffect(() => {
    updateState(appState)
  }, [appState])
  useEffect(() => {
    initDispatch(dispatch)
    updateState(appState)
    connectRemix()
  }, [])
  return (
    <AppContext.Provider
      value={{
        dispatch,
        appState,
      }}
    >
      <RouterProvider router={router} />
      <LoadingScreen />
      <ToastContainer position="bottom-right" newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover autoClose={false} theme="colored" />
    </AppContext.Provider>
  )
}

export default App
