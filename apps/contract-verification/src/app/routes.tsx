import React from 'react'
import {HashRouter as Router, Route, Routes, RouteProps} from 'react-router-dom'

import {VerifyView} from './views'
import {DefaultLayout} from './layouts'

const DisplayRoutes = () => (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <DefaultLayout from="/" title="Verify Smart Contracts">
            <VerifyView />
          </DefaultLayout>
        }
      />
    </Routes>
  </Router>
)

export default DisplayRoutes
