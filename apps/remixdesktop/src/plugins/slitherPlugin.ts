import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
// @ts-ignore
// import { SlitherClientMixin } from '../../../../libs/remixd/src/services/slitherClient'

const profile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
}

export class SlitherPlugin extends ElectronBasePlugin {
  clients: any[] // SlitherClientMixin(ElectronBasePluginClient)
  constructor() {
    super(profile, clientProfile, SlitherPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
  methods: ['analyse']
}

class SlitherPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }
}


