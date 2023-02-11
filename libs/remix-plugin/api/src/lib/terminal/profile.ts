import { ITerminal } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const terminalProfile: LibraryProfile<ITerminal> = {
  name: 'terminal',
  methods: ['log'],
}
