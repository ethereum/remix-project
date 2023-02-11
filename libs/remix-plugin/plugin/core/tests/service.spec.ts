// This test must be here to avoid circular dependancy between plugin-core & utils
import { PluginClient } from "../src"
import { PluginService, createService, activateService, getMethods } from "@remixproject/plugin-utils"

class CmdServiceWithMethods extends PluginService {
  readonly path = 'cmd'
  public methods = ['addCommand']
  constructor(protected plugin: PluginClient<any, any>) {
    super()
  }
  // Public Method
  addCommand() {
    return true
  }
  // Private Method
  _addCommand() {
    return false
  }
}

class CmdServiceWithoutMethods extends PluginService {
  readonly path = 'cmd'
  constructor(protected plugin: PluginClient<any, any>) {
    super()
  }
  // Public Method
  addCommand() {
    return true
  }
  // Private Method
  _addCommand() {
    return false
  }
}

const serviceWithMethods = {
  methods: ['addCommand'],
  addCommand: () => true,
  _addCommand: () => false,
}

const serviceWithoutMethods = {
  addCommand: () => true,
  _addCommand: () => false,
}

// GET METHODS

describe('Get Methods', () => {
  test('Service with methods property', () => {
    const methods = getMethods(new CmdServiceWithMethods(new PluginClient()))
    expect(methods).toEqual(['addCommand'])
  })
  test('Service without methods property', () => {
    const methods = getMethods(new CmdServiceWithoutMethods(new PluginClient()))
    expect(methods).toEqual(['addCommand'])
  })
  test('Object with methods property', () => {
    const methods = getMethods(serviceWithMethods)
    expect(methods).toEqual(['addCommand'])
  })
  test('Object without methods property', () => {
    const methods = getMethods(serviceWithoutMethods)
    expect(methods).toEqual(['addCommand'])
  })
})

// CREATE SERVICE

describe('Create service', () => {
  test('Create service with given methods', () => {
    const service = createService('cmd', serviceWithMethods)
    expect(service.methods.length === 1 && service.methods[0] === 'addCommand').toBeTruthy()
    expect(service.addCommand()).toBeTruthy()
  })
  test('Create service with no methods', () => {
    const service = createService('cmd', serviceWithoutMethods)
    expect(service.methods.length === 1 && service.methods[0] === 'addCommand').toBeTruthy()
    expect(service.addCommand()).toBeTruthy()
  })
  test('Create service with Plugin Service', () => {
    const service = createService('cmd', new CmdServiceWithMethods(new PluginClient()))
    expect(service.methods.length === 1 && service.methods[0] === 'addCommand').toBeTruthy()
    expect(service.addCommand()).toBeTruthy()
  })
  test('Create service with Plugin Service without method property', () => {
    const service = createService('cmd', new CmdServiceWithoutMethods(new PluginClient()))
    expect(service.methods.length === 1 && service.methods[0] === 'addCommand').toBeTruthy()
    expect(service.addCommand()).toBeTruthy()
  })
})

// ACTIVATE SERVICE

// Before Loaded
describe('Activate service', () => {

  test('Eager activation', () => {
    const client = new PluginClient<any, any>()
    const spy = spyOn(client, 'call')
    const service = createService('cmd', new CmdServiceWithMethods(client))
    activateService(client, service)
    expect(client.methods).toEqual(['addCommand'])
    expect(spy).toHaveBeenCalled()
    expect(client['cmd.addCommand']()).toBeTruthy()
  })

  test('Client activation', async () => {
    const client = new PluginClient<any, any>()
    const spy = spyOn(client, 'call')
    await client.createService('cmd', new CmdServiceWithMethods(client))
    expect(client.methods).toEqual(['addCommand'])
    expect(spy).toHaveBeenCalled()
    expect(client['cmd.addCommand']()).toBeTruthy()
  })

  test('Lazy activation', async () => {
    const client = new PluginClient<any, any>()
    const spy = spyOn(client, 'call')
    client.prepareService('cmd', () => new CmdServiceWithMethods(client))
    // Not activated
    expect(client.methods).toBeUndefined()
    expect(spy).not.toHaveBeenCalled()
    expect(client['cmd.addCommand']).toBeUndefined()
    // Activated
    await client.activateService['cmd']()
    expect(client.methods).toEqual(['addCommand'])
    expect(spy).toHaveBeenCalled()
    expect(client['cmd.addCommand']()).toBeTruthy()
  })

  test('Activate sub-service', async () => {
    const client = new PluginClient<any, any>()
    const spy = spyOn(client, 'call')
    const service = await client.createService('cmd', new CmdServiceWithMethods(client))
    await service.createService('git', {
      commit: () => true
    })
    expect(client.methods).toEqual(['addCommand', 'commit'])
    expect(spy).toHaveBeenCalledTimes(2)
    expect(client['cmd.addCommand']()).toBeTruthy()
    expect(client['cmd.git.commit']()).toBeTruthy()
  })

  test('Lazy activate sub-service', async () => {
    const client = new PluginClient<any, any>()
    const spy = spyOn(client, 'call')
    const service = await client.createService('cmd', new CmdServiceWithMethods(client))
    service.prepareService('git', () => ({
      commit: () => true
    }))
    // Sub service not activated yet
    expect(client.methods).toEqual(['addCommand'])
    expect(spy).toHaveBeenCalledTimes(1)
    expect(client['cmd.addCommand']()).toBeTruthy()
    expect(client['cmd.git.commit']).toBeUndefined()
    // Sub service activated
    await client.activateService['cmd.git']()
    expect(client.methods).toEqual(['addCommand', 'commit'])
    expect(spy).toHaveBeenCalledTimes(2)
    expect(client['cmd.addCommand']()).toBeTruthy()
    expect(client['cmd.git.commit']()).toBeTruthy()
  })
})

// EMIT

describe('Emit event from service', () => {
  test('Service should emit through the client', async () => {
    const client = new PluginClient<any, any>()
    spyOn(client, 'call')
    const spy = spyOn(client, 'emit')
    const service = await client.createService('cmd', new CmdServiceWithMethods(client))
    service.emit('event', 'arg1', 'arg2')
    expect(spy).toHaveBeenLastCalledWith('event', 'arg1', 'arg2')
  })
})