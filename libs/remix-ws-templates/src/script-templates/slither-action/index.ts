export const runSlitherAction = async (opts, plugin) => {
  if (opts && opts.isElectron) {
    return {
      // @ts-ignore
      '.github/workflows/run-slither-action.yml': (await import('!!raw-loader!./run-slither-action.yml')).default
    }
  }
  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-slither-action.yml' ,
    // @ts-ignore
    (await import('!!raw-loader!./run-slither-action.yml')).default)
}