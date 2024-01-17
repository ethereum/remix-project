import React from 'react'
import {createHashRouter, RouterProvider} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import LoadingScreen from './components/LoadingScreen'
import LogoPage from './pages/Logo'
import HomePage from './pages/Home'
import StepListPage from './pages/StepList'
import StepDetailPage from './pages/StepDetail'
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
  return (
    <>
      <RouterProvider router={router} />
      <LoadingScreen />
      <ToastContainer position="bottom-right" newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover autoClose={false} theme="colored" />
    </>
  )
}

export default App
