import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import { ElectronBasePluginRemixdClient } from "../lib/remixd"

import { FoundryClientMixin } from "../lib/foundry";
const profile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
}

export class FoundryPlugin extends ElectronBasePlugin {
  clients: any []
  constructor() {
    super(profile, clientProfile, FoundryClientMixin(FoundryPluginClient))
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'foundry',
  displayName: 'electron foundry',
  description: 'electron foundry',
  methods: ['sync', 'compile']
}


class FoundryPluginClient extends ElectronBasePluginRemixdClient {
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile);
  }
}


