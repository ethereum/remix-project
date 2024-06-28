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
          <DefaultLayout from="/" title="Verify" description="Verify compiled contracts on different verification services">
            <VerifyView />
          </DefaultLayout>
        }
      />

      <Route
        path="/receipts"
        element={
          <DefaultLayout from="/" title="Receipts" description="Check the verification statuses of contracts submitted for verification">
            <ReceiptsView />
          </DefaultLayout>
        }
      />
    </Routes>
  </Router>
)

export default DisplayRoutes
