const getWorkspaceFilesByPath = async (plugin: any, pathRegex: RegExp | null = null): Promise<{[path: string]: File}> => {
  const filesByPath: {[path: string]: File} = {}
  interface Workspace {
    children?: Workspace
    content?: string
  }
  const workspace: Workspace = await plugin.call('fileManager', 'copyFolderToJson', '/')
  const childQueue: Array<[string, Workspace]> = Object.entries(workspace)
  while (childQueue.length > 0) {
    const [path, child] = childQueue.pop()
    if ('content' in child && (pathRegex === null || pathRegex.test(path))) {
      filesByPath[path] = new File([child.content], path)
    }
    if ('children' in child) {
      childQueue.push(...Object.entries(child.children))
    }
  }
  return filesByPath
}

export const sindriScripts = async (plugin: any) => {
  // Load in all of the Sindri or Circom-related files in the workspace.
  const existingFilesByPath = await getWorkspaceFilesByPath(plugin, /sindri|\.circom$/i)
  const writeIfNotExists = async (path: string, content: string) => {
    if (!(path in existingFilesByPath)) {
      await plugin.call('fileManager', 'writeFile', path, content)
    }
  }

  // Write out all of the static files if they don't exist.
  // @ts-ignore
  await writeIfNotExists('scripts/.sindriignore', (await import('!!raw-loader!./.sindriignore')).default)
  // @ts-ignore
  await writeIfNotExists('scripts/sindri/utils.ts', (await import('!!raw-loader!./utils.ts')).default)
  // @ts-ignore
  await writeIfNotExists('scripts/sindri/run_compile.ts', (await import('!!raw-loader!./run_compile.ts')).default)
  // @ts-ignore
  await writeIfNotExists('scripts/sindri/run_prove.ts', (await import('!!raw-loader!./run_prove.ts')).default)

  // Only write out the `sindri.json` file if it doesn't already exist.
  if (!('sindri.json' in existingFilesByPath)) {
    // @ts-ignore
    const sindriManifest = (await import('./sindri.json')).default

    // Infer manifest properties from the existing files in the workspace.
    switch (sindriManifest.circuitType) {
      case 'circom':
        // Try to find the best `.circom` source file to use as the main component.
        // First, we limit ourselves to `.circom` files.
        const circomPathsAndContents = await Promise.all(
          Object.entries(existingFilesByPath)
            .filter(([path]) => /\.circom$/i.test(path))
            .map(async ([path, file]) => [path, await file.text()])
        )
        // Now we apply some heuristics to find the "best" file.
        const circomCircuitPath =
          circomPathsAndContents
            .map(([path, content]) => ({
              content,
              hasMainComponent: !!/^[ \t\f]*component[ \t\f]+main[^\n\r]*;[ \t\f]*$/m.test(content),
              // These files are the entrypoints to the Remix Circom templates, so we give them a boost if there are multiple main components.
              isTemplateEntrypoint: !!['calculate_hash.circom', 'rln.circom', 'semaphore.circom'].includes(path.split('/').pop() ?? ''),
              path,
            }))
            .sort((a, b) => {
              if (a.hasMainComponent !== b.hasMainComponent) return +b.hasMainComponent - +a.hasMainComponent
              if (a.isTemplateEntrypoint !== b.isTemplateEntrypoint) return +b.isTemplateEntrypoint - +a.isTemplateEntrypoint
              return a.path.localeCompare(b.path)
            })
            .map(({path}) => path)[0] || './circuit.circom'
        sindriManifest.circuitPath = circomCircuitPath
        break
    }

    const {name: workspaceName} = await plugin.call('filePanel', 'getCurrentWorkspace')
    sindriManifest.name =
      workspaceName
        .replace(/\s*-+\s*\d*$/, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^[^a-zA-Z]+/, '') || `my-${sindriManifest.circuitType}-circuit`

    // Remove any unsupported characters from the circuit name.
    sindriManifest.name = (sindriManifest.name || '').replace(/[^-a-zA-Z0-9_]+/g, '-')

    // Write out the modified manifest file.
    writeIfNotExists('sindri.json', JSON.stringify(sindriManifest, null, 2))
  }
}
