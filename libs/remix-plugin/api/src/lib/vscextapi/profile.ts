import { IVScodeExtAPI } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const vscodeExtProfile: LibraryProfile<IVScodeExtAPI> = {
  name: 'vscodeExtAPI',
  methods: ['executeCommand']
}
