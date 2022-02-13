// eslint-disable-next-line no-use-before-define
import React from 'react'
import ReactDOM from 'react-dom' // eslint-disable-line
import { AbstractPanel } from './panel'
import * as packageJson from '../../../../../package.json'
import { RemixPluginPanel } from '@remix-ui/panel'

const profile = {
  name: 'hiddenPanel',
  displayName: 'Hidden Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class HiddenPanel extends AbstractPanel {
  el: HTMLElement
  dispatch: React.Dispatch<any> = () => {}
  constructor () {
    super(profile)
    this.el = document.createElement('div')
    this.el.setAttribute('class', 'pluginsContainer')
  }

  addView (profile: any, view: any): void {
    super.removeView(profile)
    super.addView(profile, view)
    this.renderComponent()
  }

  render (state: any) {
    return <div className='pluginsContainer'><RemixPluginPanel header={<></>} plugins={state.plugins}/></div> 
  }

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  renderComponent () {
    this.dispatch({
      plugins: this.plugins,
    })
  }
}
