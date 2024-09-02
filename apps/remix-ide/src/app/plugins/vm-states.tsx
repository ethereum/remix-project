/* eslint-disable no-unused-vars */
import React from 'react' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import { AppModal, ModalTypes } from '@remix-ui/app'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'vm-states',
  displayName: 'vm-states',
  methods: ['saveVmState', 'loadVmState', 'listStates'],
  events: [],
  description: 'manage vm states',
  version: packageJson.version
}

export class VMStates extends Plugin {
  currentState: string
  constructor() {
    super(profile)
  }

  async saveVmState () {
    if (this.currentState) {
      const state = await this.call('blockchain', 'getStateDetails')
      this.call('fileManager', 'writeFile', `.states/${this.currentState}/state.json`, state)
    } else {
      const modalContent: AppModal = {
        id: 'saveVmState',
        title: 'Save State',
        message: (<span>Please provide a name for the state.</span>),
        modalType: ModalTypes.prompt,
        okLabel: 'OK',
        cancelLabel: 'Cancel',
        validationFn: (value) => {
          return {
            valid: true,
            message: ''
          }
        },
        okFn: async (value: string) => {
          this.currentState = value
          const state = await this.call('blockchain', 'getStateDetails')
          this.call('fileManager', 'writeFile', `.states/${value}/state.json`, state)
          this.emit('newVMStateSaved')
        },
        cancelFn: () => {},
        hideFn: () => {},
        defaultValue: ''
      }
      this.call('notification', 'modal', modalContent)
    }
  }

  async loadVmState () {
    const contextExists = await this.call('fileManager', 'exists', `.states/${this.currentState}/state.json`)
    if (contextExists) {
      return await this.call('fileManager', 'readFile', `.states/${this.currentState}/state.json`)
    } else
      throw new Error('no saved state at ' + this.currentState)
  }

  async listStates () {
    const items = await this.call('fileManager', 'readdir', `.states`)
    let states = []
    console.log('listStates', items)
    for (const key in items) {
      if (items[key].isDirectory) states.push(key)
    }
    return states
  }
}

  
  
