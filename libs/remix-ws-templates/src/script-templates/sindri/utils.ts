import sindriClient from 'sindri'
import type { CircuitInfoResponse, ProofInfoResponse } from 'sindri'

sindriClient.logLevel = 'info'

const authorize = async () => {
  try {
    const apiKey = await remix.call('settings', 'get', 'settings/sindri-access-token')
    if (!apiKey) {
      throw new Error('Missing API key.')
    }
    sindriClient.authorize({ apiKey })
  } catch {
    const message = 'No Sindri API key found. Please click the gear in the lower left corner to open the settings page, and add your API key under "Sindri Credentials".'
    await remix.call('notification', 'toast', message)
    throw new Error(message)
  }
}

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
 * Compile the circuit.
 *
 * @param {string | string[] | null} tags - The tag or tags to use when compiling the circuit.
 * @returns {CircuitInfoResponse} compiled circuit
 */
export const compile = async (tags: string | string[] | null = ['latest']): CircuitInfoResponse => {
  await authorize()
  const sindriManifest = await getSindriManifest()

  // Create a map from file paths to `File` objects for (almost) all files in the workspace.
  // We exclude `.deps/` files because these are resolved to more intuitive locations so they can
  // be used by the circuit without specifying a complex import path. We'll merge the dependencies
  // into the files at their expected import paths in a later step.
  const excludeRegex = /^\.deps\//
  const filesByPath: {[path: string]: File} = {}
  interface Workspace {
    children?: Workspace
    content?: string
  }
  const workspace: Workspace = await remix.call('fileManager', 'copyFolderToJson', '/')
  const childQueue: Array<[string, Workspace]> = Object.entries(workspace)
  while (childQueue.length > 0) {
    const [path, child] = childQueue.pop()
    if ('content' in child && !excludeRegex.test(path)) {
      filesByPath[path] = new File([child.content], path)
    }
    if ('children' in child) {
      childQueue.push(...Object.entries(child.children))
    }
  }

  // Merge any of the circuit's resolved dependencies into the files at their expected import paths.
  if (sindriManifest.circuitType === 'circom') {
    const circuitPath = normalizePath(sindriManifest.circuitPath || 'circuit.circom')
    let circuitContent: string
    try {
      circuitContent = await remix.call('fileManager', 'readFile', circuitPath)
    } catch (error) {
      console.error(`No circuit file found at "${circuitPath}", try setting "circuitPath" in "sindri.json".`)
    }
    const dependencies: {[path: string]: string} = await remix.call('circuit-compiler' as any, 'resolveDependencies', circuitPath, circuitContent)
    Object.entries(dependencies).forEach(([rawPath, rawContent]) => {
      // Convert absolute file paths to paths relative to the project root.
      const path = normalizePath(rawPath)
      // Removes any leading `/`s from Circom `include` paths to make them relative to the root.
      const content = path.endsWith('.circom') ? rawContent.replace(/^\s*include\s+"\/+([^"]+)"\s*;\s*$/gm, 'include "$1";') : rawContent
      filesByPath[path] = new File([content], path)
    })
  }

  console.log(`Compiling circuit "${sindriManifest.name}"...`)
  const files = Object.values(filesByPath)
  try {
    const circuitResponse = await sindriClient.createCircuit(files, tags)
    if (circuitResponse.status === 'Ready') {
      console.log(`Circuit compiled successfully, circuit id: ${circuitResponse.circuit_id}`)
    } else {
      console.error('Circuit compilation failed:', circuitResponse.error || 'Unknown error')
    }
    return circuitResponse
  } catch (error) {
    if ('status' in error && error.status === 401) {
      const message = 'Sindri API key authentication failed, please check that your key is correct in the settings.'
      console.error(message)
      throw new Error(message)
    } else {
      console.error('Unknown error occurred.')
      throw error
    }
  }
}

/**
 * Generate a proof against the circuit.
 *
 * @param {Object} signals - Input signals for the circuit.
 * @returns {ProofInfoResponse} The generated proof.
 */
export const prove = async (signals: {[id: string]: number | string}): ProofInfoResponse => {
  await authorize()
  const sindriManifest = await getSindriManifest()

  const circuitName = sindriManifest.name
  console.log(`Proving circuit "${circuitName}"...`)
  try {
    const proofResponse = await sindriClient.proveCircuit(circuitName, JSON.stringify(signals))
    if (proofResponse.status === 'Ready') {
      console.log(`Proof generated successfully, proof id: ${proofResponse.proof_id}`)
    } else {
      console.error('Proof generation failed:', proofResponse.error || 'Unknown error')
    }
    return proofResponse
  } catch (error) {
    if ('status' in error && error.status === 401) {
      const message = 'Sindri API key authentication failed, please check that your key is correct in the settings.'
      console.error(message)
      throw new Error(message)
    } else if ('status' in error && error.status === 404) {
      const message = `No compiled circuit "${circuitName}" found, have you successfully compiled the circuit?`
      console.error(message)
      throw new Error(message)
    } else {
      console.error('Unknown error occurred.')
      throw error
    }
  }
}
