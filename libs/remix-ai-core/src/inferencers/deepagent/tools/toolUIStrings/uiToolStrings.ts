import { ToolUIStringRegistry } from './types'

/**
 * Labels for the tools that read and drive the IDE surface.
 *
 * `capture_ui_screenshot` matters most here: it is the one tool that sends a
 * picture of the user's screen somewhere, so the spinner names it plainly and
 * fires before the capture — an announcement rather than a receipt.
 */
export const uiToolStrings: ToolUIStringRegistry = {
  capture_ui_screenshot: (args) => args?.reason
    ? `Taking a screenshot of your IDE — ${args.reason}`
    : 'Taking a screenshot of your IDE...',
  inspect_ui: () => 'Looking at the interface...',
  get_ui_state: () => 'Checking which panels are open...',
  get_ui_map: () => 'Looking up where things are in the IDE...',
  click_element: (args) => args?.ref ? `Clicking ${args.ref}...` : 'Clicking in the interface...',
  type_into_element: (args) => args?.ref ? `Typing into ${args.ref}...` : 'Typing in the interface...',
  scroll_element: () => 'Scrolling...',
  open_file: (args) => args?.path ? `Opening ${args.path}...` : 'Opening a file...'
}
