export const contractCreate2Factory = async (opts, plugin) => {
  await plugin.call('fileManager', 'writeFile',
    'contracts/libs/create2-factory.sol' ,
    // @ts-ignore
    (await import('!!raw-loader!./create2-factory.sol')).default)

  await plugin.call('fileManager', 'open', 'contracts/libs/create2-factory.sol')
}
