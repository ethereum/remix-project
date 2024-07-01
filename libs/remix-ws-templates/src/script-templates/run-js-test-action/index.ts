export const runJsTestAction = async (opts, plugin) => {
  await plugin.call('fileManager', 'writeFile',
    '.github/workflows/run-js-test.yml' ,
    // @ts-ignore
    (await import('!!raw-loader!./run-js-test.yml')).default)
}