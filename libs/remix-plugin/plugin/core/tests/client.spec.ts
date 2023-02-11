import { handleConnectionError, PluginClient } from '../src'
import { callEvent, listenEvent } from '@remixproject/plugin-utils'

// Handle Error
test('Handle Connection Error', () => {
  const devMode = { port:  8080, origins: [] }
  expect(() => handleConnectionError(devMode))
    .toThrow(`Make sure the port of the IDE is ${devMode.port}`)
  expect(() => handleConnectionError())
    .toThrow('If you are using a local IDE, make sure to add devMode in client options')
})


// Before Loaded
describe('Client is not loaded yet', () => {
  let client: PluginClient

  beforeEach(() => {
    client = new PluginClient()
  })

  test('Client has default values', () => {
    expect(client).toBeDefined()
    expect(client['isLoaded']).toBeFalsy()
    expect(client['id']).toBe(0)
  })

  test('Client should load with callback', (done) => {
    client.onload(() => {
      expect(true).toBeTruthy()
      done()
    })
    client.events.emit('loaded')
  })

  test('Client should load with promise', (done) => {
    client.onload().then(() => {
      expect(true).toBeTruthy()
      done()
    })
    client.events.emit('loaded')
  })

  test('Call should throw when client is not loaded', async () => {
    expect(() => client.call('fileManager', 'getFile', 'browser/ballot.sol'))
      .toThrow('Not connected to the IDE. If you are using a local IDE, make sure to add devMode in client options')
  })
})


// After Loaded
describe('Client is loaded', () => {
  let client: PluginClient
  beforeEach(async () => {
    client = new PluginClient()
    client.events.emit('loaded')
    await client.onload()
  })

  // CALL

  test('"Call" should trigger a send event', async (done) => {
    const name = 'fileManager', key = 'getFile', payload = 'browser/ballot.sol'
    client.events.on('send', (msg) => {
      expect(msg).toEqual({ action: 'request', name, key, payload: [payload], id: 1 })
      done()
    })
    client.call(name, key, payload)
  })

  test('Call should wait for a response', async (done) => {
    const name = 'fileManager', key = 'getFile', payload = 'browser/ballot.sol'
    client.call(name, key, payload).then((result) => {
      expect(result).toBeTruthy()
      done()
    })
    client.events.emit(callEvent(name, key, 1), true)
  })

  test('Call should throw an error', (done) => {
    const name = 'fileManager', key = 'getFile', payload = 'browser/ballot.sol'
    client.call(name, key, payload).catch((error) => {
      expect(error.message).toBe('Error from IDE : error')
      done()
    })
    client.events.emit(callEvent(name, key, 1), undefined, 'error')
  })

  // ON

  test('"On" should listen for event', () => {
    const spy = jest.fn()
    const name = 'fileManager', key = 'currentFileChanged', payload = 'browser/ballot.sol'
    client.on(name, key, spy)
    client.events.emit(listenEvent(name, key), payload)
    client.events.emit(listenEvent(name, key), payload)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(payload)
  })

  // ONCE

  test('"Once" should listen for event only once', () => {
    const spy = jest.fn()
    const name = 'fileManager', key = 'currentFileChanged', payload = 'browser/ballot.sol'
    client.once(name, key, spy)
    client.events.emit(listenEvent(name, key), payload)
    client.events.emit(listenEvent(name, key), payload)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // OFF

  test('"Off" should remove all listeners for an event', () => {
    const spy = jest.fn()
    const name = 'fileManager', key = 'currentFileChanged', payload = 'browser/ballot.sol'
    client.on(name, key, spy)
    client.events.emit(listenEvent(name, key), payload)
    client.events.emit(listenEvent(name, key), payload)
    client.off(name, key)
    client.events.emit(listenEvent(name, key), payload)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  // EMIT

  test('"Emit" should trigger an "send" event', (done) => {
    const key = 'key', payload = 'payload'
    client.events.on('send', (result) => {
      expect(result).toEqual({ action: 'emit', key, payload: [payload] })
      done()
    })
    client.emit(key, payload)
  })

})