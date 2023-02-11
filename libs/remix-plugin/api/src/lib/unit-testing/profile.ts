import { IUnitTesting } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const unitTestProfile: LibraryProfile<IUnitTesting> = {
  name: 'unitTest',
  methods: ['testFromPath', 'testFromSource'],
}
