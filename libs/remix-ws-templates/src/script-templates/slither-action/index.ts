export const runSlitherAction = async (opts, plugin) => {
  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-slither-action.yml' ,
    // @ts-ignore
    (await import('!!raw-loader!./run-slither-action.yml')).default)
}