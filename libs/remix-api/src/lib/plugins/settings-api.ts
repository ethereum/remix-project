import { StatusEvents } from '@remixproject/plugin-utils'

export interface ISettings {
  events: {
    configChanged: () => void,
    copilotChoiceUpdated: (isChecked: boolean) => void,
    copilotChoiceChanged: (isChecked: boolean) => void,
  } & StatusEvents
  methods: {
    getGithubAccessToken(): string
    get(key: string): Promise<any>
  }
}
