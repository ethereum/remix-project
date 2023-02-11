import { PluginManager, Engine } from '@remixproject/engine'
import { pluginManagerProfile } from "@remixproject/plugin-api"
import { WebsocketPlugin } from '../src'

const profile = {
  name: 'websocket',
  methods: ['mockMethod'],
  url: 'url'
}

class MockSocket extends WebsocketPlugin {
  call: jest.Mock
  on: jest.Mock
  once: jest.Mock
  off: jest.Mock
  emit: jest.Mock
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  onActivation = jest.fn()
  socket = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    close: jest.fn(),
    send: jest.fn()
  } as any
  open = jest.fn()
  constructor() {
    super(profile)
  }
  createMock() {
    this.call = jest.fn()
    this.on = jest.fn()
    this.once = jest.fn()
    this.off = jest.fn()
    this.emit = jest.fn()
  }
}

describe('Websocket plugin', () => {
  let manager: PluginManager
  let plugin: MockSocket

  beforeEach(async () => {
    const engine = new Engine()
    manager = new PluginManager(pluginManagerProfile)
    plugin = new MockSocket()
    engine.register([manager, plugin])
  })

  test('Activation', async () => {
    await plugin.activate()
    expect(plugin.onActivation).toHaveBeenCalled()
    expect(plugin.open).toHaveBeenCalled()
    expect(plugin.socket.addEventListener).toHaveBeenCalled() // reconnectOnclose
  })

  test('Reconnect on abnormal closing', (done) => {
    plugin['onclose']({ code: 0 } as any)
    setTimeout(() => {
      expect(plugin.open).toHaveBeenCalled()
      done()
    }, 1500)
  })

  test('Deactivation', async (done) => {
    await plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalled()
    expect(plugin.socket.removeEventListener).toHaveBeenCalledTimes(2) // reconnectOnclose & listener
    expect(plugin.socket.close).toHaveBeenCalled()
    setTimeout(() => {
      expect(plugin.open).not.toHaveBeenCalled() // Remove listener should block reconnection attempt
      done()
    }, 1500)
  })

  test('Post Message fails if socket not open', () => {
    try {
      plugin.socket.readyState = true
      plugin.socket.OPEN = false
      plugin['send']({ name: 'socket' })
    } catch (err) {
      expect(err.message).toBe('Websocket connection is not open yet')
    }
  })

  test('Post Message', () => {
    plugin.socket.readyState = true
    plugin.socket.OPEN = true
    plugin['send']({ name: 'socket' })
    expect(plugin.socket.send).toHaveBeenCalledWith(JSON.stringify({ name: 'socket' }))
  })

  test('Call Plugin Method', (done) => {
    const spy = spyOn(plugin, 'send' as any)
    const call = plugin['callPluginMethod']('key', ['payload'])
    const msg = { id: 0, action: 'request', key: 'key', payload: ['payload'], name: 'websocket', requestInfo: undefined }
    expect(spy).toHaveBeenCalledWith(msg)
    call.then((res) => {
      expect(res).toBeTruthy()
      done()
    })
    plugin['pendingRequest'][0](true, undefined)
  })

  test('Get Message', () => {
    plugin.createMock()
    // Action 'on'
    const on = { id: 0, action: 'on', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getEvent']({ data: JSON.stringify(on) } as any)
    expect(plugin.on.mock.calls[0][0]).toEqual('name')
    expect(plugin.on.mock.calls[0][1]).toEqual('key')
    // Action 'once'
    const once = { id: 0, action: 'once', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getEvent']({ data: JSON.stringify(once) } as any)
    expect(plugin.once.mock.calls[0][0]).toEqual('name')
    expect(plugin.once.mock.calls[0][1]).toEqual('key')
    // Action 'off'
    const off = { id: 0, action: 'off', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getEvent']({ data: JSON.stringify(off) } as any)
    expect(plugin.off).toHaveBeenCalledWith('name', 'key')
    // Action 'emit'
    const emit = { id: 0, action: 'emit', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined }
    plugin['getEvent']({ data: JSON.stringify(emit) } as any)
    expect(plugin.emit).toHaveBeenCalledWith('key', 'payload')

  })
})
