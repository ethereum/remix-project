export const sindriScripts = async (plugin) => {
    await plugin.call('fileManager', 'writeFile', 
      'scripts/sindri/sindri.ts' ,
      // @ts-ignore
      (await import('!!raw-loader!./sindri.ts')).default)

    
    await plugin.call('fileManager', 'writeFile', 
      'sindri.json' ,
      // @ts-ignore
      (await import('raw-loader!./sindri.conf')).default)
      
      
    await plugin.call('fileManager', 'open', 'scripts/sindri/sindri.ts')
  }