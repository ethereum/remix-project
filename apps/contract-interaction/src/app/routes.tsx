import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import { VerifyView, ReceiptsView, LookupView, LookupABIView, SettingsView } from './views'
import { DefaultLayout } from './layouts'
import { ContractVerificationPluginClient } from './ContractVerificationPluginClient'

export interface DisplayRoutesProps {
  plugin: ContractVerificationPluginClient
}

const DisplayRoutes = (props: DisplayRoutesProps) => (
  <Router>
    <Routes>

      <Route
        path="/"
        element={
          <DefaultLayout from="/" title="LookupABI" description="Search for verified contracts and download the ABI to Remix">
            <LookupABIView plugin={props.plugin} />
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
