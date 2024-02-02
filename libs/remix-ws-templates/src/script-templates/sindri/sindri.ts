import client from 'sindri'

/**
 * Compile the given circuit
 * @param {string} entryPoint - path to the circuit to compile
 * @param {string} apiKey - sindri API key
 * @returns {Circuit} compiled circuit
 */
export const createCircuit = async (entryPoint: string, apiKey: string) => {
    client.authorize({ apiKey })

    const sindriConf = await remix.call('fileManager', 'readFile', `sindri.json`)
    const circuit = await remix.call('fileManager', 'readFile', entryPoint)
    const deps = await remix.call('circuit-compiler' as any, 'resolveDependencies', entryPoint, circuit)

    const files = []
    files.push(new File([circuit], 'circuit.circom'))
    files.push(new File([sindriConf], 'sindri.json'))     
     
    for (const file in deps) {
        if (file === entryPoint) continue
        files.push(new File([deps[file]], file))
    }

    console.log(`creating circuit "${entryPoint}"...`)
    const circuitProject = await client.createCircuit(files)
    console.log(`circuit created ${circuitProject.circuit_id}`)
    return circuitProject
}

/**
 * Generate a proof against the given circuit
 * @param {string} circuitId - id of the circuit
 * @param {Object} signals - input signals
 * @returns {Proof} generated proof
 */
export const proveCircuit = async (circuitId: string, signals:  { [id: string]: string }, apiKey: string) => {
    client.authorize({ apiKey })
    console.log(`proving circuit ${circuitId}...`)
    const proof = await client.proveCircuit(circuitId, JSON.stringify(signals))
    console.log(`proof id: ${proof.proof_id}`)
    return proof
}


/**
 * Save the circuit 
 * @param {Circuit} circuitProject - compiled circuit
 */
export const saveCircuit = async (circuitProject) => {
    await remix.call('fileManager', 'writeFile', `.sindri/${circuitProject.circuit_id}.json`, JSON.stringify(circuitProject, null, '\t'))    
}

/**
 * Load the circuit 
 * @param {string} circuitId - id of the circuit
 * @param {Object} signals - input signals
 * @returns {Proof} generated proof
 */
export const loadCircuit = async (circuitId: string) => {
    return JSON.parse(await remix.call('fileManager', 'readFile', `.sindri/${circuitId}.json`))
}
