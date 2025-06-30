export const etherscanScripts = async (opts, plugin) => {
  if (opts && opts.isElectron) {
    return {
      // @ts-ignore
      'scripts/etherscan/verifyScript.ts': (await import('!!raw-loader!./verifyScript.ts')).default,
      // @ts-ignore
      'scripts/etherscan/receiptGuidScript.ts': (await import('!!raw-loader!./receiptGuidScript.ts')).default
    }
  }

  await plugin.call('fileManager', 'writeFile',
    'scripts/etherscan/verifyScript.ts',
    // @ts-ignore
    (await import('!!raw-loader!./verifyScript.ts')).default)

  await plugin.call('fileManager', 'open', 'scripts/etherscan/verifyScript.ts')

  await plugin.call('fileManager', 'writeFile',
    'scripts/etherscan/receiptGuidScript.ts',
    // @ts-ignore
    (await import('!!raw-loader!./receiptGuidScript.ts')).default)

  await plugin.call('fileManager', 'open', 'scripts/etherscan/receiptGuidScript.ts')
}