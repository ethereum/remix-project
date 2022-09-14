import React from "react"
import {
  HashRouter as Router,
  Route,
  Routes,
  RouteProps,
} from "react-router-dom"

import { ErrorView, HomeView, ReceiptsView, CaptureKeyView } from "./views"
import { DefaultLayout } from "./layouts"

interface Props extends RouteProps {
  component: any // TODO: new (props: any) => React.Component
  from: string
}

const RouteWithHeader = ({ component: Component, ...rest }: Props) => {
  return (
    <Route
      {...rest}      
    >
      <DefaultLayout {...rest}>
          <Component />
        </DefaultLayout>
    </Route>
  )
}

export const DisplayRoutes = () => (
  <Router>
    <Routes>    
      <Route
        path="/"
        element={<DefaultLayout from="/">
                  <HomeView />
                </DefaultLayout>} />
      <Route path="/error"
      element={<ErrorView />} />
      <Route
        path="/receipts"
        element={<DefaultLayout from="/receipts">
                  <ReceiptsView />
                </DefaultLayout>} />
      <Route
        path="/settings"
        element={<DefaultLayout from="/settings">
                  <CaptureKeyView />
                </DefaultLayout>} />
    </Routes>
  </Router>
)
