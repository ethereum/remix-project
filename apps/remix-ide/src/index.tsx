// eslint-disable-next-line no-use-before-define
import React from 'react'
import ReactDOM from 'react-dom'
import AppComponent from './app'
// eslint-disable-next-line no-unused-vars
import { RemixApp } from '@remix-ui/app'

const appComponent = new AppComponent()
appComponent.run()

ReactDOM.render(
  <React.StrictMode>
    <RemixApp app={appComponent}></RemixApp>
  </React.StrictMode>,
  document.getElementById('root')
)
