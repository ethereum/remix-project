import { IContentImport } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const contentImportProfile: LibraryProfile<IContentImport> = {
  name: 'contentImport',
  methods: ['resolve','resolveAndSave'],
}
