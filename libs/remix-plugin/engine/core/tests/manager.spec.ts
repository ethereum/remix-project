import { Engine, Plugin, PluginManager } from '../src'

class To extends Plugin {
  constructor() {
    super({ name: 'to', methods: ['mockMethod'] })
  }
  askUserPermission = jest.fn(super.askUserPermission)
  mockMethod = jest.fn(() => this.askUserPermission('mockMethod'))
}

class MockManager extends PluginManager {
  canCall = jest.fn(async (from) => from === 'from')
}


describe('Abstract Plugin', () => {
  let from: Plugin
  let anotherFrom: Plugin
  let to: To
  let manager: MockManager
  beforeEach(async () => {
    from = new Plugin({ name: 'from' })
    anotherFrom = new Plugin({ name: 'anotherFrom' })
    to = new To()
    manager = new MockManager()
    const engine = new Engine()
    engine.register([manager, from, to, anotherFrom])
    await manager.activatePlugin(['from', 'to', 'anotherFrom'])
  })

  test('Can Call is exposed', async () => {
    await from.call('to', 'mockMethod')
    expect(to.mockMethod).toHaveBeenCalledTimes(1)
    expect(to.askUserPermission).toHaveBeenCalledWith('mockMethod')
    expect(manager.canCall).toHaveBeenCalledWith('from', 'to', 'mockMethod', undefined)
  })

  test('', async () => {
    const [ shouldBeTrue, shouldBeFalse ] = await Promise.all([
      from.call('to', 'mockMethod'),
      anotherFrom.call('to', 'mockMethod')
    ])
    expect(to.mockMethod).toHaveBeenCalledTimes(2)
    expect(shouldBeTrue).toBeTruthy()
    expect(shouldBeFalse).toBeFalsy()
    expect(manager.canCall.mock.calls[0][0]).toBe('from')
    expect(manager.canCall.mock.calls[1][0]).toBe('anotherFrom')
  })
})