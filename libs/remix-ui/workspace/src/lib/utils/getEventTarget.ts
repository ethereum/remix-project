export const getEventTarget = async (e: any, useLabel: boolean = false) => {
  let target = e.target as HTMLElement
  while (target && target.getAttribute && !target.getAttribute(useLabel? 'data-label-path' : 'data-path')) {
    target = target.parentElement
  }
  if (target && target.getAttribute) {
    const path = target.getAttribute(useLabel? 'data-label-path' : 'data-path')
    const type = target.getAttribute(useLabel? 'data-label-type' : 'data-type')
    const position = target.getBoundingClientRect()
    // get size of element

    const endPosition = {
      top: position.top - position.height * 2 + 4,
      left: position.left ,
    }

    const content = target.textContent
    return {
      path,
      type,
      content,
      position: endPosition
    }
  }
}

/**
   *  When multiple files are selected in FileExplorer,
   *  and these files are dragged to a target folder,
   *  this function will build the profile of each selected item
   *  in FileExplorer so they can be moved when dropped
   * @param target - Initial target item in FileExplorer
   * @returns - {DragStructure} Array of selected items
   */
export const buildMultiSelectedItemProfiles = (target: {
  path: string
  type: string
  content: string
  position: {
      top: number
      left: number
  }
  }) => {
  const selectItems = []
  document.querySelectorAll('li.remixui_selected').forEach(item => {

    const dragTarget = {
      position: { top: target?.position.top || 0, left: target?.position.left || 0 },
      path: item.getAttribute('data-path') || item.getAttribute('data-label-path') || '',
      type: item.getAttribute('data-type') || item.getAttribute('data-label-type') || '',
      content: item.textContent || ''
    }
    selectItems.push(dragTarget)
  })
  return selectItems
}
