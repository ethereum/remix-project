export const etherscanScripts = async (plugin) => {
    await plugin.call('fileManager', 'writeFile', 
        'scripts/etherscan/verifyScript.ts' ,
        // @ts-ignore
        (await import('!!raw-loader!./verifyScript.ts')).default)

    await plugin.call('fileManager', 'writeFile', 
        'scripts/etherscan/receiptGuidScript.ts' ,
        // @ts-ignore
        (await import('!!raw-loader!./receiptGuidScript.ts')).default)
}