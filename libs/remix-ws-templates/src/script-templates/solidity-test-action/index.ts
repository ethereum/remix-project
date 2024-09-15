export const runSolidityUnittestingAction = async (opts, plugin) => {
  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-solidity-unittesting.yml' ,
    // @ts-ignore
    (await import('!!raw-loader!./run-solidity-unittesting.yml')).default)
}