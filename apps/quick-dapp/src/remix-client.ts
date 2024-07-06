import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-webview';
import { initInstance } from './actions';

class RemixClient extends PluginClient {
  constructor() {
    super();
    createClient(this);
  }

  edit({ address, abi, network, name, devdoc, methodIdentifiers, solcVersion }: any): void {
    initInstance({
      address,
      abi,
      network,
      name,
      devdoc,
      methodIdentifiers,
      solcVersion,
    });
  }
}

export default new RemixClient();
