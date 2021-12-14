'use strict'
import React from 'react' // eslint-disable-line
import { RemixApp } from '@remix-ui/app'
import AppComponent from './app-component'

const appComponent = new AppComponent()
appComponent.run()
function App () {
  return <>
    <RemixApp app={appComponent}></RemixApp>
  </>
}

export default App
