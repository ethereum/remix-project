import { IWindow } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const windowProfile: LibraryProfile<IWindow> = {
  name: 'window',
  methods: ['prompt', 'confirm', 'alert'],
}