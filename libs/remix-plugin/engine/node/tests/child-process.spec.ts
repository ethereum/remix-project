import { ChildProcessPlugin } from "../src"
import { PluginManager, Engine } from "@remixproject/engine"
import { pluginManagerProfile } from "@remixproject/plugin-api"
import { fork } from 'child_process'


jest.mock('child_process', () => ({
  fork: jest.fn(url => ({
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
    kill: jest.fn()
  }))
}))

const profile = {
  name: 'child-process',
  methods: ['mockMethod'],
  url: 'url'
}

class MockChildProcess extends ChildProcessPlugin {
  call: jest.Mock
  on: jest.Mock
  once: jest.Mock
  off: jest.Mock
  emit: jest.Mock
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  onActivation = jest.fn()
  // process: {
  //   on: jest.fn(),
  //   off: jest.fn(),
  //   send: jest.fn(),
  //   disconnect: jest.fn()
  // }
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


describe('ChildProcess plugin', () => {
  let manager: PluginManager
  let plugin: MockChildProcess

  beforeEach(async () => {
    const engine = new Engine()
    manager = new PluginManager(pluginManagerProfile)
    plugin = new MockChildProcess()
    engine.register([manager, plugin])
  })

  test('Activation', async () => {
    await plugin.activate()
    expect(plugin.onActivation).toHaveBeenCalled()
    expect(fork).toHaveBeenCalledWith('url')
    expect(plugin.process.on).toHaveBeenCalled()
  })

  test('Deactivation', async () => {
    await plugin.activate()
    await plugin.deactivate()
    expect(plugin.onDeactivation).toHaveBeenCalled()
    expect(plugin.process.off).toHaveBeenCalledTimes(1)
    expect(plugin.process.disconnect).toHaveBeenCalledTimes(1)
    expect(plugin.process.kill).toHaveBeenCalledTimes(1)
  })

  test('Post Message fails if process not open', async () => {
    try {
      await plugin.activate();
      (plugin.process as any).connected = false
      plugin['send']({ name: 'child-process' })
    } catch (err) {
      expect(err.message).toBe('Child process from plugin "child-process" is not yet connected')
    }
  })

  test('Post Message', async () => {
    await plugin.activate();
    (plugin.process as any).connected = true
    plugin['send']({ name: 'child-process' })
    expect(plugin.process.send).toHaveBeenCalledWith({ name: 'child-process' })
  })

  test('Call Plugin Method', (done) => {
    const spy = spyOn(plugin, 'send' as any)
    const call = plugin['callPluginMethod']('key', ['payload'])
    const msg = { id: 0, action: 'request', key: 'key', payload: ['payload'], name: 'child-process', requestInfo: undefined }
    expect(spy).toHaveBeenCalledWith(msg)
    call.then((res) => {
      expect(res).toBeTruthy()
      done()
    })
    plugin['pendingRequest'][0](true, undefined)
  })

  test('Get Message', async () => {
    await plugin.activate()
    plugin.createMock()
    // Action 'on'
    const on = { id: 0, action: 'on', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](on)
    expect(plugin.on.mock.calls[0][0]).toEqual('name')
    expect(plugin.on.mock.calls[0][1]).toEqual('key')
    // Action 'once'
    const once = { id: 0, action: 'once', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](once)
    expect(plugin.once.mock.calls[0][0]).toEqual('name')
    expect(plugin.once.mock.calls[0][1]).toEqual('key')
    // Action 'off'
    const off = { id: 0, action: 'off', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](off)
    expect(plugin.off).toHaveBeenCalledWith('name', 'key')
    // Action 'emit'
    const emit = { id: 0, action: 'emit', key: 'key', payload: ['payload'], name: 'name', requestInfo: undefined } as const
    plugin['getMessage'](emit)
    expect(plugin.emit).toHaveBeenCalledWith('key', 'payload')

  })
})
