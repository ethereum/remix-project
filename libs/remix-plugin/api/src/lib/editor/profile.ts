import { IEditor } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const editorProfile: LibraryProfile<IEditor> = {
  name: 'editor',
  methods: ['discardHighlight', 'highlight', 'addAnnotation', 'clearAnnotations', 'discardHighlightAt', 'gotoLine'],
}
