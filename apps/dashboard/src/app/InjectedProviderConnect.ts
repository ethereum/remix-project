import { WebsocketPlugin } from '@remixproject/engine-web'

const profile = {
  name: 'InjectedProviderConnect',
  displayName: 'InjectedProviderConnect',
  url: 'ws://127.0.0.1:65530',
  methods: ['compile', 'sync'],
  description: '',
  kind: 'other',
  version: '0.0.1'
}

export class InjectedProviderConnect extends WebsocketPlugin {
  provider: any

  init () {
    this.provider = (window as any).ethereum
    if (!this.provider) {
        console.log('there is no provider')
        return // no provider to connect to
    }
    this.provider.request({ method: "eth_requestAccounts" }) // request login and activate
    const url = 'http://127.0.0.1:8081'
    const webSocket = new WebSocket(url)
    
    webSocket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        this.sendToProvider(msg)
    }
  }

  async sendToProvider(msg: any): Promise<any> {
    let resultData
    if (this.provider.send) resultData = await this.provider.send(msg.method, msg.params)
    else if (this.provider.request) resultData = await this.provider.request({ method: msg.method, params: msg.params})
    else {
        console.log('provider is not valid')
    }
    return resultData
  }
}

