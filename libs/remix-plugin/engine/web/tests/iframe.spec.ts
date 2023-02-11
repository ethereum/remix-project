import { Engine, PluginManager } from '@remixproject/engine'
import { HostPlugin } from '../src'
import { pluginManagerProfile } from '@remixproject/plugin-api'
import { IframePlugin } from '../src'

class MockHost extends HostPlugin {
  currentFocus = jest.fn() // () => string
  focus = jest.fn() // (name: string) =>
  addView = jest.fn() // (profile: Profile) =>
  removeView = jest.fn() // (name: string) =>
  constructor() {
    super({ name: 'sidePanel', methods: [] })
  }
}
class MockIframe extends IframePlugin {
  callMockEvent: (...payload: any[]) => any
  call: jest.Mock
  on: jest.Mock
  off: jest.Mock
  once: jest.Mock
  constructor() {
    super({ name: 'iframe', location: 'sidePanel', methods: [], url: 'https://url' })
  }

  async connect(url: string) {
    super.connect(url);  // don't wait for the returned value as it's waiting for handshake
    return true
  }

  // Mock methods after activation
  onActivation() {
    this.call = jest.fn(async () => true)
    this.on = jest.fn((name, method, cb) => this.callMockEvent = (...payload) => cb(...payload))
    this.off = jest.fn()
    this.once = jest.fn()
  }
}


describe('Iframe Plugin', () => {
  let manager: PluginManager
  let iframe: MockIframe
  let host: MockHost

  beforeEach(async () => {
    const engine = new Engine()
    manager = new PluginManager(pluginManagerProfile)
    iframe = new MockIframe()
    host = new MockHost()
    engine.register([manager, iframe, host])
    await manager.activatePlugin(['sidePanel', 'iframe'])
  })

  test('iframe is created', () => {
    expect(iframe['iframe']).toBeTruthy()
  })

  // ACTIVATION

  test('Activation set iframe element', async () => {
    await manager.activatePlugin('iframe')
    expect(iframe['iframe'].src).toEqual('https://url/')
  })

  // Didn't manage to test whatever happen after onload

  // test.only('Activation call handshake', async (done) => {
  //   const spy = spyOn(iframe, 'callPluginMethod' as any)
  //   iframe['iframe'].addEventListener('load', () => {
  //     expect(spy).toHaveBeenCalledWith('handshake')
  //     done()
  //   })
  //   await manager.activatePlugin('iframe')
  // })

  // METHODS

  test('callPluginMethod post message', async () => {
    const spy = spyOn(iframe, 'send' as any)
    iframe['currentRequest'] = { from: 'manager' }
    iframe['callPluginMethod']('method', ['params'])
    const msg = { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'iframe', requestInfo: { from: 'manager' } }
    expect(spy).toHaveBeenCalledWith(msg)
  })

  test('callPluginMethod create pendingRequest', async (done) => {
    spyOn(iframe, 'send' as any) // Mock send cause iframe is not set yet
    iframe['callPluginMethod']('method', ['params'])
      .then((result) => {
        expect(result).toBeTruthy()
        done()
      })
    iframe['pendingRequest'][0](true, null)
  })

  test('callPluginMethod create pendingRequest', async (done) => {
    spyOn(iframe, 'send' as any) // Mock send cause iframe is not set yet
    iframe['callPluginMethod']('method', ['params'])
      .catch((err) => {
        expect(err).toBe('Error')
        done()
      })
    iframe['pendingRequest'][0](null, 'Error')
  })

  // Get Message: response
  test('getEvent with response should trigger pendingRequest', (done) => {
    spyOn(iframe, 'send' as any) // Mock send cause iframe is not set yet
    iframe['origin'] = 'url'
    const event = {
      origin: 'url',
      data: { id: 0, action: 'response', key: 'method', payload: ['params'] }
    }
    iframe['callPluginMethod']('method', ['params']).then((result) => {
      expect(result).toEqual(['params'])
      done()
    })
    iframe['getEvent'](event as any)
  })

  test('getEvent should forward to getMessage', () => {
    const spy = spyOn(iframe, 'getMessage' as any)
    const origin = 'url'
    const data = { id: 0, action: 'request', key: 'method', payload: ['params'], name: 'manager' }
    iframe['origin'] = origin
    iframe['getEvent']({ origin,  data } as any)
    expect(spy).toHaveBeenCalledWith(data)
  })
})