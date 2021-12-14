'use strict'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { RemixApp } from '@remix-ui/app'
import AppComponent from './app-component'

const appComponent = new AppComponent()
appComponent.run()
class App {
  render () {
    if (this.el) return this.el
    this.el = document.createElement('div')
    return this.el
  }

  renderComponent () {
    return ReactDOM.render(<RemixApp app={appComponent}></RemixApp>
      , this.el)
  }

  init () {
    this.renderComponent()
  }
}

module.exports = App
