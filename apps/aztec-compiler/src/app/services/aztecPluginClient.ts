import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'

export class AztecPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    this.methods = ['init', 'compile']
    createClient(this)
    this.internalEvents = new EventManager()
    this.onload()
  }

  init(): void {
    console.log('[aztec-plugin] Initialized!')
  }

  onActivation(): void {
    this.internalEvents.emit('aztec_activated')
  }

  async compile(): Promise<void> {
    try {
      this.internalEvents.emit('aztec_compiling_start')
      this.emit('statusChanged', { key: 'loading', title: 'Compiling Aztec project...', type: 'info' })

      // 👇 실제 컴파일 요청은 기존에 하던 WebSocket+S3 방식과 연동 가능
      // 예를 들어 backend API 호출하거나 websocket 열거나

      this.internalEvents.emit('aztec_compiling_done')
      this.emit('statusChanged', { key: 'success', title: 'Compile complete.', type: 'success' })
    } catch (e: any) {
      this.emit('statusChanged', { key: 'error', title: e.message, type: 'error' })
      this.internalEvents.emit('aztec_compiling_errored', e)
      console.error('[aztec-plugin] compile error:', e)
    }
  }
}
