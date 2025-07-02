import { Monaco } from '@monaco-editor/react'
import { monacoTypes } from '@remix-ui/editor'

export const showCustomDiff = async (
    changes: any[],
    uri: string,
    editor: any,
    monaco: Monaco, 
    addDecoratorCollection: any,
    addAcceptDeclineWidget: any,
    setDecoratorListCollection: any,
    acceptHandler: any,
    rejectHandler: any,
    setCurrentDiffFile: any) => {

    console.log(changes)
    setCurrentDiffFile(uri)
    let lineShift = 0
    for (const lineChange of changes) {
      if (lineChange.discarded) continue
      if (!lineChange.part.added && !lineChange.part.removed) continue

      console.log('lineChange', lineChange.type, lineChange)

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
        ranges = [
          new monaco.Range(lineShift + lineChange.lineNumber, 0, lineShift + lineChange.lineNumber + lineChange.part.count - 1, 1000),
          new monaco.Range(lineShift + lineChange.lineNumber + lineChange.part.count - 1, 0, lineShift + lineChange.lineNumber + lineChange.part.count - 1 + lineChange.previous.part.count, 1000),
        ]
      }
      
      const widgetId = `accept_decline_widget${Math.random().toString(36).substring(2, 15)}`
      const decoratorList = addDecoratorCollection(widgetId, ranges)

      setDecoratorListCollection(decoratorListCollection => {
        /*Object.keys(decoratorListCollection).forEach((widgetId) => {
          const decoratorList = decoratorListCollection[widgetId]
          if (decoratorList) rejectHandler(decoratorList, widgetId)
          editor.removeContentWidget({
            getId: () => widgetId
          })
        })*/
        return { [widgetId]: decoratorList }
      })
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the decoration to be added
      /*
      ((lineChange, addAcceptDeclineWidget, acceptHandler, rejectHandler, decoratorList) => {
        const newEntryRange = decoratorList.getRange(0)
        addAcceptDeclineWidget(widgetId, editor, { column: 0, lineNumber: newEntryRange.startLineNumber + 1 }, () => acceptHandler(decoratorList, widgetId, lineChange.type), () => rejectHandler(decoratorList, widgetId, lineChange.type))
      })(lineChange, addAcceptDeclineWidget, acceptHandler, rejectHandler, decoratorList)*/

      const newEntryRange = decoratorList.getRange(0)
      addAcceptDeclineWidget(widgetId, editor, { column: 0, lineNumber: newEntryRange.startLineNumber + 1 }, () => acceptHandler(decoratorList, widgetId, lineChange.type), () => rejectHandler(decoratorList, widgetId, lineChange.type))

      await new Promise(resolve => setTimeout(resolve, 500)) // Wait for the widget to be added

      if (lineChange.type === 'added' || lineChange.type === 'modified') {
        lineShift += lineChange.part.count
      }
    }
  }

// Function to extract ranges with line numbers and changed text
export const extractLineNumberRangesWithText = (diff) => {
  const changes = []

  let originalLinesIncr = 1
  let modifedLinesIncr = 1
  diff.forEach((part, index) => {
  if (part.added || part.removed) {
    const lineNumber = originalLinesIncr // part.removed ? originalLinesIncr : modifedLinesIncr
    const previousChanged = changes[index - 1]
    const modified = (previousChanged && previousChanged.lineNumber && previousChanged.lineNumber === lineNumber) || false
    if (modified && part.added && previousChanged.type === 'removed') {
      previousChanged.discarded = true      
    }
    if (modified && part.removed && previousChanged.type === 'added') {
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