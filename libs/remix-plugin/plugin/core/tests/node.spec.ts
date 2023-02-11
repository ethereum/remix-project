import { PluginClient } from '@remixproject/plugin'
import { PluginNode } from '../src'

class MockClient extends PluginClient {
  call = jest.fn()
  on = jest.fn()
}

describe('Plugin node', () => {
  let client: MockClient
  let node: PluginNode
  beforeEach(() => {
    client = new MockClient()
    node = new PluginNode('external', client)
  })

  test('Get', () => {
    const deepNode = node.get('service')
    expect(deepNode['path']).toBe('external.service')
    expect(deepNode instanceof PluginNode).toBeTruthy()
  })

  test('Call', () => {
    node.get('service').call('method', 'payload')
    expect(client.call).toHaveBeenCalledWith('external.service', 'method', ['payload'])
  })

  test('On', () => {
    node.get('service').on('method', () => {})
    expect(client.on.mock.calls[0][0]).toBe('external')
    expect(client.on.mock.calls[0][1]).toBe('method')
  })

})