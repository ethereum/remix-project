import { Monaco } from '@monaco-editor/react'
import { monacoTypes } from '@remix-ui/editor'
import type { ChangeObject } from 'diff'

/* Function to show custom diff in the editor
 * @param {Array} changes - Array of changes to be displayed in the editor
 * @param {string} uri - URI of the file being edited
 * @param {Object} editor - Monaco editor instance
 * @param {Object} monaco - Monaco instance
 * @param {Function} addDecoratorCollection - Function to add a decorator collection
 * @param {Function} addAcceptDeclineWidget - Function to add accept/decline widget
 * @param {Function} setDecoratorListCollection - Function to set the decorator list collection
 * @param {Function} acceptHandler - Function to handle accept action
 * @param {Function} rejectHandler - Function to handle reject action
 * @param {Function} setCurrentDiffFile - Function to set the current diff file
 */
export const showCustomDiff = async (
  changes: ChangeType[],
  uri: string,
  editor: any,
  monaco: Monaco,
  addDecoratorCollection: (widgetId: string, ranges: monacoTypes.IRange[]) => monacoTypes.editor.IEditorDecorationsCollection,
  addAcceptDeclineWidget: (id: string, editor: any, position: { lineNumber: number, column: number }, acceptHandler, rejectHandler, acceptAllHandler?, rejectAllHandler?) => void,
  setDecoratorListCollection: React.Dispatch<React.SetStateAction<Record<string, monacoTypes.editor.IEditorDecorationsCollection>>>,
  acceptHandler: (decoratorList: any, widgetId: string) => void,
  rejectHandler: (decoratorList: any, widgetId: string) => void,
  acceptAllHandler: () => void,
  rejectAllHandler: () => void,
  setCurrentDiffFile: React.Dispatch<React.SetStateAction<string>>,
  changedTypeMap: ChangeTypeMap) => {

  setCurrentDiffFile(uri)
  let lineShift = 0
  for (const lineChange of changes) {
    if (lineChange.discarded) continue
    if (!lineChange.part.added && !lineChange.part.removed) continue

    if (lineChange.type === 'added') {
      editor.executeEdits('lineChanged', [
        {
          range: new monaco.Range(lineShift + lineChange.lineNumber, 0, lineShift + lineChange.lineNumber, 0),
          text: lineChange.part.value,
        },
      ])
    }

    if (lineChange.type === 'modified') {
      editor.executeEdits('lineChanged', [
        {
          range: new monaco.Range(lineShift + lineChange.lineNumber, 0, lineShift + lineChange.lineNumber, 0),
          text: lineChange.part.value,
        },
      ])
    }
    /*
        The ranges var contains the ranges of the lines that have been changed.
        If the lineChange.type is 'added', it means that the line has been added to the editor.
        If the lineChange.type is 'removed', it means that the line has been removed from the editor.
        If the lineChange.type is 'modified', it means that the line has been modified in the editor.
        The first item represents a line that has been added.
        The second item represents a line that has been removed.
      */
    let ranges
    if (lineChange.type === 'added') {
      ranges = [
        new monaco.Range(lineShift + lineChange.lineNumber, 0, lineShift + lineChange.lineNumber + lineChange.part.count - 1, 1000)
      ]
    } else if (lineChange.type === 'removed') { // removed
      ranges = [
        null, // new monaco.Range(lineChange.originalStartLineNumber, 0, lineChange.originalStartLineNumber, 1000),
        new monaco.Range(lineShift + lineChange.lineNumber, 0,lineShift + lineChange.lineNumber + lineChange.part.count - 1, 1000),
      ]
    } else if (lineChange.type === 'modified') { // modified
      const addedStartLine = lineShift + lineChange.lineNumber
      const addedEndLine = addedStartLine + lineChange.part.count - 1
      const removedStartLine = addedEndLine + 1
      const removedEndLine = removedStartLine + lineChange.previous.part.count - 1
      ranges = [
        new monaco.Range(addedStartLine, 0, addedEndLine, 1000),
        new monaco.Range(removedStartLine, 0, removedEndLine, 1000),
      ]
    }
    const widgetId = `accept_decline_widget${Math.random().toString(36).substring(2, 15)}`
    const decoratorList = addDecoratorCollection(widgetId, ranges)

    changedTypeMap[widgetId] = lineChange.type
    setDecoratorListCollection(decoratorListCollection => ({ ...decoratorListCollection, [widgetId]: decoratorList }))

    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for the decoration to be added

    const newEntryRange = decoratorList.getRange(0)
    addAcceptDeclineWidget(widgetId, editor, { column: 0, lineNumber: newEntryRange.startLineNumber + 1 }, () => acceptHandler(decoratorList, widgetId), () => rejectHandler(decoratorList, widgetId))

    await new Promise(resolve => setTimeout(resolve, 200)) // Wait for the widget to be added

    if (lineChange.type === 'added' || lineChange.type === 'modified') {
      lineShift += lineChange.part.count
    }
  }
}

export type ChangeTypeMap = {
    [key: string]: 'added' | 'removed' | 'modified'
  }

export type ChangeType = {
  part: ChangeObject<string>
  lineNumber?: number
  type?: 'added' | 'removed' | 'modified'
  previous?: ChangeType | null
  originalLinesIncr?: number
  modifedLinesIncr?: number
  discarded?: boolean
}

// Function to extract ranges with line numbers and changed text
export const extractLineNumberRangesWithText = (diff: ChangeObject<string>[]) => {
  const changes: ChangeType[] = []

  let originalLinesIncr = 1
  let modifedLinesIncr = 1
  diff.forEach((part, index) => {
    if (part.added || part.removed) {
      let lineNumber = originalLinesIncr // part.removed ? originalLinesIncr : modifedLinesIncr
      const previousChanged = changes[index - 1]
      const modified = (previousChanged && previousChanged.lineNumber && previousChanged.lineNumber === lineNumber - 1) || false
      if (modified && part.added && previousChanged.type === 'removed') {
        lineNumber = lineNumber - 1
        previousChanged.discarded = true
      }
      if (modified && part.removed && previousChanged.type === 'added') {
        lineNumber = lineNumber - 1
        previousChanged.discarded = true
      }
      changes.push({
        part,
        lineNumber,
        type: modified ? 'modified' : (part.added ? 'added' : 'removed'),
        previous: modified ? previousChanged : null,
        originalLinesIncr,
        modifedLinesIncr
      })
      if (part.removed) originalLinesIncr += part.count
      if (part.added) modifedLinesIncr += part.count
    } else {
      changes.push({
        part
      })
      originalLinesIncr += part.count
      modifedLinesIncr += part.count
    }
  })
  return changes
}
