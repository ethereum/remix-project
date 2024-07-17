import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import { VerifyView, ReceiptsView, LookupView, SettingsView } from './views'
import { DefaultLayout } from './layouts'

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

      <Route
        path="/lookup"
        element={
          <DefaultLayout from="/" title="Lookup" description="Search for verified contracts and download them to Remix">
            <LookupView />
          </DefaultLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <DefaultLayout from="/" title="Settings" description="Customize settings for each verification service and chain">
            <SettingsView />
          </DefaultLayout>
        }
      />
    </Routes>
  </Router>
)

export default DisplayRoutes
