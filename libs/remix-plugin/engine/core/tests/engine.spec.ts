import { Engine, Plugin, PluginManager } from '../src'
import { listenEvent } from '@remixproject/plugin-utils'
import { compilerProfile, filSystemProfile, pluginManagerProfile } from '@remixproject/plugin-api'

export class MockEngine extends Engine {
  onRegistration = jest.fn()
  setPluginOption = jest.fn(() => ({ queueTimeout: 10000 }))
}

export class MockManager extends PluginManager {
  activatePlugin = jest.fn(super.activatePlugin)
  deactivatePlugin = jest.fn(super.deactivatePlugin)
  onRegistration = jest.fn()
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onPluginActivated = jest.fn()
  onPluginDeactivated = jest.fn()
  onProfileAdded = jest.fn()
  canActivatePlugin = jest.fn(async () => true)
  canDeactivatePlugin = jest.fn(async (from) => from.name === 'manager' ? true : false)
  canCall = jest.fn(async () => true)
  constructor() {
    super(pluginManagerProfile)
  }
}

export class MockSolidity extends Plugin {
  onActivation = jest.fn()
  onDeactivation = jest.fn()
  onRegistration = jest.fn()
  compile = jest.fn()
  slowMockMethod = jest.fn((num: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, num || 1000)
    })
  })
  getCompilationResult = jest.fn()
  constructor() {
    super({ ...compilerProfile, name: 'solidity', methods:['slowMockMethod', ...compilerProfile.methods] })
  }
}


export class MockFileManager extends Plugin {
  private files: Record<string, string> = {}
  private active: string

  constructor() {
    super({ ...filSystemProfile, name: 'fileManager' })
  }

  getCurrentFile = jest.fn(() => this.files[this.active])
  getFile = jest.fn((path: string) => this.files[path])
  getFolder = jest.fn(() => ({}))
  setFile = jest.fn((path: string, content: string) => this.files[path] = content)
  switchFile = jest.fn((path: string) => {
    this.active = path
    this.emit('currentFileChanged', path)
  })
}

describe('Registration with Engine', () => {

  test('Manager is registered', () => {
    const manager = new MockManager()
    const engine = new MockEngine()
    engine.register(manager)
    expect(engine.isRegistered('manager')).toBeTruthy()
  })

  test('Manager emits onRegistration for itself', async () => {
    const manager = new MockManager()
    const engine = new MockEngine()
    engine.register(manager)
    expect(manager.onRegistration).toHaveBeenCalledTimes(1)
    expect(engine.onRegistration).toHaveBeenCalledTimes(1)
  })

  test('Call onRegistration for other plugins', async () => {
    const manager = new MockManager()
    const solidity = new MockSolidity()
    const engine = new MockEngine()
    engine.register([manager, solidity, new MockFileManager()])
    expect(engine.onRegistration).toHaveBeenCalledTimes(3)
    expect(manager.onProfileAdded).toHaveBeenCalledTimes(3)
    expect(solidity.onRegistration).toHaveBeenCalledTimes(1)
  })

  test('Call setPluginOption on registration', async () => {
    const manager = new MockManager()
    const engine = new MockEngine()
    const solidity = new MockSolidity()
    engine.register([manager, solidity, new MockFileManager()])
    expect(engine.setPluginOption).toHaveBeenCalledWith(solidity.profile)
    expect(solidity['options'].queueTimeout).toBe(10000)
  })
})

describe('Manager', () => {
  let manager: MockManager
  let solidity: MockSolidity
  let fileManager: MockFileManager
  let engine: Engine

  beforeEach(async () => {
    solidity = new MockSolidity()
    fileManager = new MockFileManager()
    manager = new MockManager()
    engine = new MockEngine()
    engine.register([manager, solidity, fileManager])
  })

  test('Activation', async () => {
    await manager.activatePlugin('manager')
    const spyEmit = spyOn(manager, 'emit')
    await manager.activatePlugin('solidity')
    expect(manager.onPluginActivated).toHaveBeenCalledTimes(2)  // manager + solidity
    expect(manager.onActivation).toBeCalledTimes(1)
    expect(solidity.onActivation).toBeCalledTimes(1)
    expect(await manager.isActive('solidity')).toBeTruthy()
    expect(spyEmit).toHaveBeenCalledWith('pluginActivated', solidity.profile)
  })

  test('Deactivation', async () => {
    await manager.activatePlugin('manager')
    const spyEmit = spyOn(manager, 'emit')
    await manager.activatePlugin('solidity')
    await manager.deactivatePlugin('solidity')
    expect(manager.onPluginDeactivated).toHaveBeenCalledTimes(1)
    expect(solidity.onDeactivation).toBeCalledTimes(1)
    expect(await manager.isActive('solidity')).toBeFalsy()
    expect(spyEmit).toHaveBeenCalledWith('pluginDeactivated', solidity.profile)
  })

  test('Toggle activation', async () => {
    await manager.activatePlugin('manager')
    const onActivation = spyOn(solidity, 'onActivation')
    const onDeactivation = spyOn(solidity, 'onDeactivation')
    await manager.toggleActive('solidity')
    await manager.toggleActive('solidity')
    expect(onActivation).toBeCalledTimes(1)
    expect(onDeactivation).toBeCalledTimes(1)
  })

})


describe('Remix Engine', () => {
  let manager: MockManager
  let solidity: MockSolidity
  let fileManager: MockFileManager
  let engine: Engine

  beforeEach(() => {
    solidity = new MockSolidity()
    fileManager = new MockFileManager()
    manager = new MockManager()
    engine = new MockEngine()
    engine.register([manager, solidity, fileManager])
  })

  test('Listening to event should add a event record', async () => {
    await manager.activatePlugin('solidity')
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', () => {})
    expect(engine['listeners'][event][0]).toEqual('solidity')
  })

  test('Listeners with "on" are registered', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    solidity.on('fileManager', 'currentFileChanged', (file: any) => {
      expect(file).toEqual('newFile')
      done()
    })
    engine['events']['solidity'][event]('newFile')
  })

  test('Engine catch event emitted by activated plugins', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const event = listenEvent('fileManager', 'currentFileChanged')
    engine['listeners'][event] = ['solidity'] // Need to register a listener else nothing is broadcasted
    engine['events']['solidity'][event] = (file) => {
      expect(file).toEqual('newFile')
      done()
    }
    fileManager.emit('currentFileChanged', 'newFile')
  })

})

describe('Plugin interaction', () => {
  let manager: MockManager
  let solidity: MockSolidity
  let fileManager: MockFileManager
  let engine: Engine

  beforeEach(() => {
    solidity = new MockSolidity()
    fileManager = new MockFileManager()
    manager = new MockManager()
    engine = new MockEngine()
    engine.register([manager, solidity, fileManager])
  })

  // Call

  test('Plugin can call another plugin method', async () => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    await fileManager.call('solidity', 'compile', 'ballot.sol')
    expect(solidity.compile).toHaveBeenCalledWith('ballot.sol')
    expect(solidity.compile).toHaveBeenCalledTimes(1)
    expect(solidity['currentRequest']).toBeUndefined()
  })

  test('Plugin can cancel another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    fileManager.call('solidity', 'slowMockMethod', 500).catch((err) => {
      expect(solidity['currentRequest']).toBeUndefined()
      expect(err).toBe('[CANCEL] Canceled call slowMockMethod from fileManager')
      done()
    })
    setTimeout(() => {
        fileManager.cancel('solidity', 'slowMockMethod')
    },250)
  })

  test('Plugin cannot cancel another plugin that is not activated', async () => {
    await manager.activatePlugin(['fileManager'])
    try {
      await fileManager.cancel('solidity', 'slowMockMethod')
    } catch(err) {
      expect(err.message).toBe('fileManager cannot cancel slowMockMethod of solidity, because solidity is not activated')
    }
  })

  test('Plugin cannot cancel an unknown method on another plugin', async () => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    try {
      await fileManager.cancel('solidity', 'unknownMethod')
    } catch (err) {
      expect(err.message).toBe('Cannot cancel "unknownMethod" of "solidity" from "fileManager", because "unknownMethod" is not exposed. Here is the list of exposed methods: "slowMockMethod","compile","getCompilationResult","compileWithParameters","setCompilerConfig","canDeactivate"')
    }
  })

  test('Plugin cannot cancel another plugin that is not activated without a method specified', async () => {
    await manager.activatePlugin(['fileManager'])
    try {
      await fileManager.cancel('solidity', '')
    } catch(err) {
      expect(err.message).toBe('fileManager cannot cancel calls onsolidity, because solidity is not activated')
    }
  })

  test('Current Request has been updated during call', async () => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    let _currentRequest: Plugin['currentRequest']
    const updateReq = jest.fn((req) => _currentRequest = req)
    const setCurrentRequest = () => Object.defineProperty(solidity, 'currentRequest', {
      configurable: true, // getter/setter can be deleted with "delete"
      get: () => _currentRequest,
      set: updateReq
    })
    // Call with manager
    setCurrentRequest()
    await manager.call('solidity', 'compile', 'ballot.sol')
    expect(solidity['currentRequest']).toBeUndefined()
    expect(_currentRequest).toEqual({ from: 'manager', path: 'solidity' })
    // Call with fileManager
    setCurrentRequest()
    await fileManager.call('solidity', 'compile', 'ballot.sol')
    expect(solidity['currentRequest']).toBeUndefined()
    expect(_currentRequest).toEqual({ from: 'fileManager', path: 'solidity' })
    expect(updateReq).toHaveBeenCalledTimes(2)
  })

  test('Plugin can activate another', async () => {
    await manager.activatePlugin('solidity')
    await solidity.call('manager', 'activatePlugin', 'fileManager')
    const isActive = await manager.isActive('fileManager')
    expect(manager.activatePlugin).toHaveBeenCalledWith('fileManager')
    expect(manager.canActivatePlugin).toHaveBeenCalledWith(solidity.profile, fileManager.profile)
    expect(isActive).toBeTruthy()
  })

  test('Plugin cannot deactivate another by default', async () => {
    try {
      await manager.activatePlugin(['solidity', 'fileManager'])
      await solidity.call('manager', 'deactivatePlugin', 'fileManager')
    } catch (err) {
      expect(err.message).toEqual('Plugin solidity has no right to deactivate plugin fileManager')
      const isActive = await manager.isActive('fileManager')
      expect(manager.canDeactivatePlugin).toHaveBeenCalledWith(solidity.profile, fileManager.profile)
      expect(isActive).toBeTruthy()
    }
  })

  test('Plugin can deactivate another if permitted', async () => {
    manager.canDeactivatePlugin = jest.fn(async (from) => true)
    await manager.activatePlugin(['solidity', 'fileManager'])
    await solidity.call('manager', 'deactivatePlugin', 'fileManager')
    const isActive = await manager.isActive('fileManager')
    expect(manager.deactivatePlugin).toHaveBeenCalledWith('fileManager')
    expect(manager.canDeactivatePlugin).toHaveBeenCalledWith(solidity.profile, fileManager.profile)
    expect(isActive).toBeFalsy()
  })

  // On

  test('Plugin can listen on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.on('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(2)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

  // Once

  test('Plugin can listen once on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.once('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(1)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

  // Off
  test('Plugin can listen once on another plugin method', async (done) => {
    await manager.activatePlugin(['solidity', 'fileManager'])
    const caller = jest.fn()
    solidity.on('fileManager', 'currentFileChanged', caller)
    fileManager.emit('currentFileChanged', 'ballot.sol')
    solidity.off('fileManager', 'currentFileChanged')
    fileManager.emit('currentFileChanged', 'ballot.sol')
    expect(caller).toHaveBeenCalledTimes(1)
    expect(caller).toHaveBeenLastCalledWith('ballot.sol')
    done()
  })

})