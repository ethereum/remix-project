
export const contractDeployerScripts = async (opts, plugin) => {
  console.log('contractDeployerScripts', opts, plugin)
  if (opts && opts.isElectron) {
    return {
      // @ts-ignore
      'scripts/contract-deployer/create2-factory-deploy.ts': (await import('!!raw-loader!./create2-factory-deploy.ts')).default,
      // @ts-ignore
      'scripts/contract-deployer/basic-contract-deploy.ts': (await import('!!raw-loader!./basic-contract-deploy.ts')).default
    }
  }

  await plugin.call('fileManager', 'writeFile',
    'scripts/contract-deployer/create2-factory-deploy.ts',
    // @ts-ignore
    (await import('!!raw-loader!./create2-factory-deploy.ts')).default)

  await plugin.call('fileManager', 'open', 'scripts/contract-deployer/create2-factory-deploy.ts')

  await plugin.call('fileManager', 'writeFile',
    'scripts/contract-deployer/basic-contract-deploy.ts',
    // @ts-ignore
    (await import('!!raw-loader!./basic-contract-deploy.ts')).default)

  await plugin.call('fileManager', 'open', 'scripts/contract-deployer/basic-contract-deploy.ts')
}