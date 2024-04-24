import { Actions } from "@remix-ui/xterm"
import { Plugin } from "@remixproject/engine"

export const createTerminal = async (shell: string = '', plugin: Plugin, workingDir: string, dispatch: React.Dispatch<Actions>) => {
  const pid = await plugin.call('xterm', 'createTerminal', workingDir, shell)
  dispatch({ type: 'SHOW_OUTPUT', payload: false })
  dispatch({ type: 'HIDE_ALL_TERMINALS', payload: null })
  dispatch({ type: 'ADD_TERMINAL', payload: { pid, queue: '', timeStamp: Date.now(), ref: null, hidden: false } })

}
