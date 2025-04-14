export const runJsTestAction = async (opts, plugin) => {
  if (opts && opts.isElectron) {

    return {
    // @ts-ignore
      '.github/workflows/run-js-test.yml': (await import('!!raw-loader!./run-js-test.yml')).default
    }
  }

  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-js-test.yml',
    // @ts-ignore
    (await import('!!raw-loader!./run-js-test.yml')).default)
}