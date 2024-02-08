export const sindriScripts = async (plugin) => {
  await plugin.call('fileManager', 'writeFile',
    'scripts/sindri/sindri.ts' ,
    // @ts-ignore
    (await import('!!raw-loader!./sindri.ts')).default)

  // Only write out the `.sindriignore` file if it doesn't already exist.
  let sindriIgnoreExists: boolean
  try {
    await plugin.call('fileManager', 'readFile', './.sindriignore')
    sindriIgnoreExists = true
  } catch {
    sindriIgnoreExists = false
  }
  if (!sindriIgnoreExists) {
    await plugin.call('fileManager', 'writeFile',
      '.sindriignore',
      // @ts-ignore
      (await import('raw-loader!./.sindriignore')).default)
  }

  // Only write out the `sindri.json` file if it doesn't already exist.
  let sindriJsonExists: boolean
  try {
    await plugin.call('fileManager', 'readFile', './sindri.json')
    sindriJsonExists = true
  } catch {
    sindriJsonExists = false
  }
  if (!sindriJsonExists) {
    await plugin.call('fileManager', 'writeFile',
      'sindri.json',
      // @ts-ignore
      (await import('./sindri.json.raw!=!raw-loader!./sindri.json')).default)
  }

  await plugin.call('fileManager', 'open', 'scripts/sindri/sindri.ts')
}
