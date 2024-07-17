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
