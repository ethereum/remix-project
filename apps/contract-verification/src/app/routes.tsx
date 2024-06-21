import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import { VerifyView } from './views'
import { DefaultLayout } from './layouts'
import { ReceiptsView } from './views/ReceiptsView'

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

      <Route
        path="/receipts"
        element={
          <DefaultLayout from="/" title="Receipts">
            <ReceiptsView />
          </DefaultLayout>
        }
      />
    </Routes>
  </Router>
)

export default DisplayRoutes
