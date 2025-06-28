import { StatusEvents } from '@remixproject/plugin-utils'

export interface IGitHubAuthHandlerApi {
  events: {
    onLogin: (data: { token: string }) => void
    onLogout: () => void
    onError: (data: { error: string }) => void
  } & StatusEvents
  methods: {
    login: () => Promise<string>
    logout: () => Promise<void>
    getToken: () => Promise<string | null>
  }
}
