/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RemixUiSolidityUmlGen } from '@remix-ui/solidity-uml-gen' 
import { ISolidityUmlGen } from 'libs/remix-ui/solidity-uml-gen/src/types'

const profile = {
    name: 'solidityumlgen',
    displayName: 'Solidity UML Generator',
    description: 'Generate UML diagram in svg format from last compiled contract',
    location: 'mainPanel',
    methods: ['showUmlDiagram'],
    events: [],
}

export class SolidityUmlGen extends ViewPlugin implements ISolidityUmlGen {
  element: HTMLDivElement
  currentFile: string
  svgPayload: string
  amIActivated: boolean
  constructor() {
    super(profile)
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'sol-uml-gen')
  }

  onActivation(): void {
      this.amIActivated = true
      console.log('amIActivated is set to true')
  }

  onDeactivation(): void {
      this.amIActivated = false
      console.log('amIActivated is set to false')
  }

  showUmlDiagram(path: string, svgPayload: string) {
    if (!this.amIActivated) return
    if(path.length < 1 || (svgPayload.length < 1 || !svgPayload.startsWith('<svg'))) {
      this.call('notification', 'alert', {
        id: 'solidityumlgenAlert',
        message: 'Both file path and svg payload are required!'
      })
      return
    } else {
      this.currentFile = path
      this.svgPayload = svgPayload
    }

  }

  render() {
      return <div id="sol-uml-gen"><RemixUiSolidityUmlGen plugin={this} /></div>
  }
}