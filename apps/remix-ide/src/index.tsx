// eslint-disable-next-line no-use-before-define
import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import AppComponent from './app'
// eslint-disable-next-line no-unused-vars
const RemixApp = lazy(() => import ('@remix-ui/app'));

const appComponent = new AppComponent()
appComponent.run().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <RemixApp app={appComponent} />
      </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
  )
})
