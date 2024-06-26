import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import * as remixd from '@remix-project/remixd'
import { ElectronBasePluginRemixdClient } from "../lib/remixd";
const profile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
}

export class SlitherPlugin extends ElectronBasePlugin {
  clients: any []
  constructor() {
    super(profile, clientProfile, remixd.SlitherClientMixin(SlitherPluginClient))
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
  methods: ['analyse']
}


class SlitherPluginClient extends ElectronBasePluginRemixdClient {
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile);
  }
}


