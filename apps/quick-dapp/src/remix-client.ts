import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-webview';
import { initInstance } from './actions';

class RemixClient extends PluginClient {
  constructor() {
    super();
    createClient(this);
  }

  edit({ address, abi, network, name, devdoc, methodIdentifiers }: any): void {
    initInstance({
      address,
      abi,
      network,
      name,
      devdoc,
      methodIdentifiers,
    });
  }
}

export default new RemixClient();
