import { PluginType } from "../remix-ui-editor"

export const retrieveNodesAtPosition = async (positionOffset: number, plugin: PluginType) => {
  let nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', positionOffset)
  // if no nodes exits at position, try to get the block of which the position is in
  const block = await plugin.call('codeParser', 'getANTLRBlockAtPosition', positionOffset, null)

  if (!nodesAtPosition.length) {
    if (block) {
      nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', block.start)
    }
  }
  return { nodesAtPosition, block }
}