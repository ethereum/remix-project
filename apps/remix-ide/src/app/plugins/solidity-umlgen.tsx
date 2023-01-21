/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RemixUiSolidityUmlGen } from '@remix-ui/solidity-uml-gen' 

const profile = {
    name: 'solidityumlgen',
    displayName: 'Solidity UML Generator',
    description: '',
    location: 'mainPanel',
    methods: [''],
    events: [],
}

export class SolidityUmlGen extends ViewPlugin {
  element: HTMLElement
  constructor() {
    super(profile)
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'sol-uml-gen')
  }

  hi() {
    console.log('hello yourself')
  }

  render() {
      return <div id="sol-uml-gen"><RemixUiSolidityUmlGen plugin={this} /></div>
  }
}