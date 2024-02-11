export const sindriScripts = async (plugin) => {
  await plugin.call('fileManager', 'writeFile',
    'scripts/sindri/utils.ts' ,
    // @ts-ignore
    (await import('!!raw-loader!./utils.ts')).default)

  await plugin.call('fileManager', 'writeFile',
    'scripts/sindri/run_compile.ts' ,
    // @ts-ignore
    (await import('!!raw-loader!./run_compile.ts')).default)

  await plugin.call('fileManager', 'writeFile',
    'scripts/sindri/run_prove.ts' ,
    // @ts-ignore
    (await import('!!raw-loader!./run_prove.ts')).default)

  const existingFiles = await plugin.call('fileManager', 'readdir', '')

  // Only write out the `.sindriignore` file if it doesn't already exist.
  if (!('.sindriignore' in existingFiles)) {
    await plugin.call('fileManager', 'writeFile',
      '.sindriignore',
      // @ts-ignore
      (await import('raw-loader!./.sindriignore')).default)
  }

  // Only write out the `sindri.json` file if it doesn't already exist.
  if (!('sindri.json' in existingFiles)) {
    await plugin.call('fileManager', 'writeFile',
      'sindri.json',
      // @ts-ignore
      (await import('./sindri.json.raw!=!raw-loader!./sindri.json')).default)
  }

  await plugin.call('fileManager', 'open', 'scripts/sindri/sindri.ts')
}
