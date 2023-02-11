import { PluginClient } from '@remixproject/plugin'
import { listenEvent, callEvent } from '@remixproject/plugin-utils'
import { createClient } from '../src'

declare const global  // Needed to mock fetch

function createEvent(data, postMessage?) {
  return {
    origin: 'http://remix.ethereum.org',
    source: {
      postMessage
    },
    data
  }
}

const baseMsg = { name: 'name', key: 'key', id: 1 }

// This test is deprecated but is kept as an inspiration model for future tests
describe.skip('Iframe', () => {
  let sendMessage: (event) => void
  let client: PluginClient

  // We use beforeAll so we don't have to wait for handshake each time
  beforeAll(() => {
    // Mock fetch api
    const mockFetchPromise = Promise.resolve({
      json: () => Promise.resolve([
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org"
      ])
    })
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise)
    window.addEventListener = (event, cb) => sendMessage = cb
    client = new PluginClient()
    createClient(client)
  })

  test('Return error to parent if not loaded', (done) => {
    const msg = { ...baseMsg, action: 'notification' }
    const errorMessage = (message) => {
      expect(message).toEqual({ ...msg, error: 'Handshake before communicating'})
      done()
    }
    const event = createEvent(msg, errorMessage)
    sendMessage(event)
  })

  test('Load on handshake', (done) => {
    const message = { action: 'request', key: 'handshake' }
    client.events.on('loaded', () => {
      expect(true).toBeTruthy()
      done()
    })
    sendMessage(createEvent(message))
  })

  test('Send notification', (done) => {
    const msg = { ...baseMsg, action: 'notification', payload: [true] }
    client.events.on(listenEvent(msg.name, msg.key), (payload) => {
      expect(payload).toBeTruthy()
      done()
    })
    sendMessage(createEvent(msg))
  })

  test('Send response with payload', (done) => {
    const msg = { ...baseMsg, action: 'response', payload: [true] }
    const listener = (payload) => {
      expect(payload).toBeTruthy()
      client.events.removeListener(callEvent(msg.name, msg.key, msg.id), listener)
      done()
    }
    client.events.on(callEvent(msg.name, msg.key, msg.id), listener)
    sendMessage(createEvent(msg))
  })

  test('Send response with error', (done) => {
    const msg = { ...baseMsg, action: 'response', error: 'error' }
    const listener = (payload, err) => {
      expect(payload).toBeUndefined()
      expect(err).toBe(msg.error)
      client.events.removeListener(callEvent(msg.name, msg.key, msg.id), listener)
      done()
    }
    client.events.on(callEvent(msg.name, msg.key, msg.id), listener)
    sendMessage(createEvent(msg))
  })

  test('Request method from parent succeed', (done) => {
    const msg = { ...baseMsg, action: 'request', payload: [true] }
    client[msg.key] = (isTrue: boolean) => !isTrue
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({ ...msg,  action: 'response', payload: false })
      delete client[msg.key]  // Need to delete because we use beforeAll
      done()
    })
    sendMessage(event)
  })

  test('Request method from parent failed', (done) => {
    const msg = { ...baseMsg, action: 'request' }
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({
        ...msg, action: 'response',
        error: `Method ${msg.key} doesn't exist on plugin ${msg.name}`
      })
      done()
    })
    sendMessage(event)
  })

  // Request Info with one level path -> no change
  test('Request method from parent with requestInfo', (done) => {
    const requestInfo = { path: 'remixd' }
    const msg = { ...baseMsg, action: 'request', payload: [true], requestInfo }
    client[msg.key] = (isTrue: boolean) => !isTrue
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({ ...baseMsg, action: 'response', payload: false })
      delete client[msg.key]  // Need to delete because we use beforeAll
      done()
    })
    sendMessage(event)
  })

  // Request Info with two level path -> call service
  test('Request method from parent with service requestInfo', (done) => {
    const requestInfo = { path: 'remixd.cmd' }
    const msg = { ...baseMsg, action: 'request', id: 1, payload: [true], requestInfo }
    client['cmd.key'] = (isTrue: boolean) => !isTrue
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({ ...baseMsg, action: 'response', payload: false })
      delete client['cmd.key']  // Need to delete because we use beforeAll
      done()
    })
    sendMessage(event)
  })

  // Request Info with two level path -> call service
  test('Request method from parent with subservice requestInfo', (done) => {
    const requestInfo = { path: 'remixd.cmd.git' }
    const msg = {  ...baseMsg, action: 'request', payload: [true], requestInfo }
    client['cmd.git.key'] = (isTrue: boolean) => !isTrue
    const event = createEvent(msg, (result) => {
      expect(result).toEqual({  ...baseMsg, action: 'response', payload: false })
      delete client['cmd.git.key']  // Need to delete because we use beforeAll
      done()
    })
    sendMessage(event)
  })

  // Create Iframe
  test('Build an Iframe Plugin from extended PluginClient', () => {
    class Client extends PluginClient {}
    const iframeClient = createClient(new Client())
    expect(iframeClient['fileManager']).toBeDefined()
    expect(iframeClient['network']).toBeDefined()
    expect(iframeClient['solidity']).toBeDefined()
    expect(iframeClient['solidityUnitTesting']).toBeDefined()
    expect(iframeClient['theme']).toBeDefined()
    expect(iframeClient['udapp']).toBeDefined()
  })
})