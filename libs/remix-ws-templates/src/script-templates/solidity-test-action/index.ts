export const runSolidityUnittestingAction = async (opts, plugin) => {
  if (opts && opts.isElectron) {
    return {
      // @ts-ignore
      '.github/workflows/run-solidity-unittesting.yml': (await import('!!raw-loader!./run-solidity-unittesting.yml')).default
    }
  }
  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-solidity-unittesting.yml' ,
    // @ts-ignore
    (await import('!!raw-loader!./run-solidity-unittesting.yml')).default)
}