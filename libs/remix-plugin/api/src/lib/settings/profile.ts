import { ISettings } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const settingsProfile: LibraryProfile<ISettings> = {
  name: 'settings',
  methods: ['getGithubAccessToken'],
}
