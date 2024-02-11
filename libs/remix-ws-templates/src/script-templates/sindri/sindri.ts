import client from 'sindri'

const getSindriManifest = async () => {
  const sindriJson = await remix.call('fileManager', 'readFile', `sindri.json`)
  return JSON.parse(sindriJson)
}

const normalizePath = (path: string): string => {
  while (path.startsWith('/') || path.startsWith('./')) {
    path = path.replace(/^(\.\/|\/)/, '')
  }
  return path
}

/**
 * Compile the given circuit
 * @param {string} apiKey - sindri API key
 * @returns {Circuit} compiled circuit
 */
export const createCircuit = async (apiKey: string) => {
  const sindriManifest = await getSindriManifest()
  client.authorize({apiKey})

  // Create a map from file paths to `File` objects for all files in the workspace.
  const filesByPath: {[path: string]: File} = {}
  interface Workspace {
    children?: Workspace
    content?: string
  }
  const workspace: Workspace = await remix.call('fileManager', 'copyFolderToJson', '/')
  const childQueue: Array<[string, Workspace]> = Object.entries(workspace)
  while (childQueue.length > 0) {
    const [path, child] = childQueue.pop()
    if ('content' in child) {
      filesByPath[path] = new File([child.content], path)
    }
    if ('children' in child) {
      childQueue.push(...Object.entries(child.children))
    }
  }

  // Merge any of the circuit's resolved dependencies into the files at their expected import paths.
  if (sindriManifest.circuitType === 'circom') {
    const circuitPath = normalizePath(sindriManifest.circuitPath || 'circuit.circom')
    const circuitContent = await remix.call('fileManager', 'readFile', circuitPath)
    const dependencies: {[path: string]: string} = await remix.call('circuit-compiler' as any, 'resolveDependencies', circuitPath, circuitContent)
    Object.entries(dependencies).forEach(([rawPath, content]) => {
      const path = normalizePath(rawPath)
      filesByPath[path] = new File([content], path)
    })
  }

  console.log(`creating circuit "${entryPoint}"...`)
  const files = Object.values(filesByPath)
  const circuitProject = await client.createCircuit(files)
  console.log(`circuit created ${circuitProject.circuit_id}`)
  return circuitProject
}

/**
 * Generate a proof against the given circuit
 * @param {Object} signals - input signals
 * @param {string} apiKey - sindri API key
 * @returns {Proof} generated proof
 */
export const proveCircuit = async (signals: {[id: string]: string}, apiKey: string) => {
  const sindriManifest = await getSindriManifest()
  client.authorize({apiKey})

  const circuitName = sindriManifest.name
  console.log(`proving circuit "${circuitName}"...`)
  const proof = await client.proveCircuit(circuitName, JSON.stringify(signals))
  console.log(`proof id: ${proof.proof_id}`)
  return proof
}
