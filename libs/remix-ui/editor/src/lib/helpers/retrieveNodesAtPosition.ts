import { EditorAPIType, PluginType } from "../remix-ui-editor"

export const retrieveNodesAtPosition = async (editorAPI: EditorAPIType, plugin: PluginType) => {
    const cursorPosition = editorAPI.getCursorPosition()
    let nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
    // if no nodes exits at position, try to get the block of which the position is in
    const block = await plugin.call('codeParser', 'getANTLRBlockAtPosition', cursorPosition, null)

    if (!nodesAtPosition.length) {
        if (block) {
            nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', block.start)
        }
    }
    return { nodesAtPosition, block }
}