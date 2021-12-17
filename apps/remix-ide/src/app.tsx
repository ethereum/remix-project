'use strict'
import React from 'react' // eslint-disable-line
import { RemixApp } from '@remix-ui/app'
import AppComponent from './app-component'

const appComponent = new AppComponent()
appComponent.run()

function App () {
  return <>
    <React.StrictMode>
      <RemixApp app={appComponent}></RemixApp>
    </React.StrictMode>
  </>
}

export default App
