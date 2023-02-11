import { PluginClient, createApi, getApiMap } from '../src'
import { Api, ExternalProfile, CustomApi, callEvent, listenEvent, StatusEvents, Profile, LocationProfile } from '@remixproject/plugin-utils'

interface TestApi extends Api {
  events: {
    event: (isTrue: boolean) => void
  } & StatusEvents
  methods: {
    method: (isTrue: boolean) => boolean
  }
}

const profile: Profile<TestApi> & ExternalProfile & LocationProfile = {
  name: 'test',
  methods: ['method'],
  location: 'sidePanel',
  url: 'url'
}

describe('Client Api', () => {
  let client: PluginClient<TestApi, any>
  let api: CustomApi<TestApi>
  beforeEach(() => {
    client = new PluginClient()
    client['isLoaded'] = true
    api = createApi<TestApi>(client, profile)
  })

  test('Should create an Api', () => {
    expect(api).toBeDefined()
    expect(api.on).toBeDefined()
    expect(api.method).toBeDefined()
  })

  test('"Method" should send a message', done => {
    client.events.on('send', message => {
      expect(message).toEqual({
        action: 'request',
        name: 'test',
        key: 'method',
        payload: [true],
        id: 1,
      })
      done()
    })
    api.method(true)
  })

  test('"Method" should return a promise', done => {
    client.events.on('send', ({ name, key, id, payload }) => {
      client.events.emit(callEvent(name, key, id), payload[0])
    })
    api.method(true).then(isTrue => {
      expect(isTrue).toBeTruthy()
      done()
    })
  })

  test('"Event" should emit an event', done => {
    api.on('event', isTrue => {
      expect(isTrue).toBeTruthy()
      done()
    })
    client.events.emit(listenEvent('test', 'event'), true)
  })

  test('getApiMap returns a map of API', () => {
    const { test } = getApiMap(client, { test: profile })
    expect(test.on).toBeDefined()
    expect(test.method).toBeDefined()
  })

})
