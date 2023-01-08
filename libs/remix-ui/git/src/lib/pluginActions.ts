import { ViewPlugin } from "@remixproject/engine-web"
import { commitChange, gitActionDispatch } from "../types"

let plugin: ViewPlugin, dispatch: React.Dispatch<gitActionDispatch>

export const setPlugin = (p: ViewPlugin, dispatcher: React.Dispatch<gitActionDispatch>) => {
    plugin = p
    dispatch = dispatcher
}

export const statusChanged = (badges: number) => {
    if(!plugin) return
    plugin.emit('statusChanged', {
        key: badges === 0 ? 'none' : badges,
        type: badges === 0 ? '' : 'success',
        title: 'Git changes'
    })
}

export const openFile = async (path: string) => {
    if(!plugin) return
    await plugin.call('fileManager', 'open', path)
}

export const openDiff = async (change: commitChange) => {
    if(!plugin) return
    plugin.call('fileManager', 'diff', change)
}
