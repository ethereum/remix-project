export const arkivScripts = async (opts, plugin) => {
  if (opts && opts.isElectron) {
    return {
      // @ts-ignore
      'scripts/arkiv/README.md': (await import('!!raw-loader!./README.md')).default,
      // @ts-ignore
      'scripts/arkiv/arkiv.ts': (await import('!!raw-loader!./arkiv.ts')).default,
    }
  }

  await plugin.call('fileManager', 'writeFile',
    'scripts/arkiv/README.md',
    // @ts-ignore
    (await import('!!raw-loader!./README.md')).default)

  await plugin.call('fileManager', 'writeFile',
    'scripts/arkiv/arkiv.ts',
    // @ts-ignore
    (await import('!!raw-loader!./arkiv.ts')).default)

  await plugin.call('fileManager', 'open', 'scripts/arkiv/arkiv.ts')

  await plugin.call('fileManager', 'open', 'scripts/arkiv/README.md')
}
