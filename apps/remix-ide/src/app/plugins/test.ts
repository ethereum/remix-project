import { Plugin } from '@remixproject/engine'
import { Profile } from '@remixproject/plugin-utils'
import { AlertModal } from 'libs/remix-ui/app/src/lib/remix-app/interface'
import { ModalTypes } from 'libs/remix-ui/app/src/lib/remix-app/types'
import { AppModal } from '../../../../../libs/remix-ui/app/src'

const profile:Profile = {
  name: 'testerplugin',
  displayName: 'testerplugin',
  description: 'testerplugin',
  methods: []
}

export class ModalPluginTester extends Plugin {
  constructor () {
    super(profile)
  }

  handleMessage (message: any): void {
    console.log(message)
  }

  onActivation (): void {
    // just a modal
    let mod:AppModal = {
      id: 'modal1',
      title: 'test',
      message: 'test',
      okFn: this.handleMessage,
      okLabel: 'yes',
      cancelFn: null,
      cancelLabel: 'no'
    }
    // this.call('modal', 'modal', mod)

    // modal with callback
    mod = { ...mod, message: 'gist url', modalType: ModalTypes.prompt, defaultValue: 'prompting' }
    // this.call('modal', 'modal', mod)

    // modal with password
    mod = { ...mod, message: 'enter password to give me eth', modalType: ModalTypes.password, defaultValue: 'pass' }
    // this.call('modal', 'modal', mod)

    const al:AlertModal = {
      id: 'myalert',
      message: 'alert message'
    }
    this.call('modal', 'alert', al)

    // set toaster
    this.call('modal', 'toast', 'toast message')
  }
}
