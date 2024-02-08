export const sindriScripts = async (plugin) => {
  await plugin.call('fileManager', 'writeFile',
    'scripts/sindri/sindri.ts' ,
    // @ts-ignore
    (await import('!!raw-loader!./sindri.ts')).default)

  // Only write out the `sindri.json` file if it doesn't already exist.
  let sindriJsonExists: boolean
  try {
    await plugin.call('fileManager', 'readFile', './fake.json')
    sindriJsonExists = true
  } catch {
    sindriJsonExists = false
  }
  if (!sindriJsonExists) {
    await plugin.call('fileManager', 'writeFile',
      'sindri.json',
      // @ts-ignore
      (await import('raw-loader!./sindri.conf')).default)
  }

  await plugin.call('fileManager', 'open', 'scripts/sindri/sindri.ts')
}
