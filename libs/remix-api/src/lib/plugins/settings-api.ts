import { StatusEvents } from '@remixproject/plugin-utils'

export interface ISettings {
  events: {
    configChanged: () => void,
  } & StatusEvents
  methods: {
    getGithubAccessToken(): string
    get(key: string): Promise<any>
  }
}
