import { ElectronPlugin } from '@remixproject/engine-electron'
import { Profile } from '@remixproject/plugin-utils'

const profile: Profile = {
  displayName: 'VSCodeSync',
  name: 'VSCodeSync',
  description: 'VSCodeSync',
}

export class VSCodeSync extends ElectronPlugin {
  constructor() {
    super(profile)
  }

  onActivation() {
    console.log('VsCodeSync activated')
  }

}
