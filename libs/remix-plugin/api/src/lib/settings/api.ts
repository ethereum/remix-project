import { StatusEvents } from '@remixproject/plugin-utils'

export interface ISettings {
  events: {} & StatusEvents
  methods: {
    getGithubAccessToken(): string
  }
}
