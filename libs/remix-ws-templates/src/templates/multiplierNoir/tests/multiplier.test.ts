// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expect } = require('chai')
import { compile, createFileManager } from '@noir-lang/noir_wasm'
import { Noir } from '@noir-lang/noir_js'
import { UltraPlonkBackend } from '@aztec/bb.js'

async function getCircuit() {
  const fm = createFileManager('/')

  const circuit = await remix.call('fileManager', 'readFile', 'src/main.nr')
  const nargoToml = await remix.call('fileManager', 'readFile', 'Nargo.toml')
  const tomlBytes = new TextEncoder().encode(nargoToml)
  const mainBytes = new TextEncoder().encode(circuit)
  await fm.writeFile('./src/main.nr', new Blob([mainBytes]).stream())
  await fm.writeFile('Nargo.toml', new Blob([tomlBytes]).stream())

  const result = await compile(fm)
  if (!('program' in result)) {
    throw new Error('Compilation failed')
  }

  return result.program
}

describe('Noir Program Test', () => {
  it('should compile, execute, prove, and verify', async () => {
    const noir_program = await getCircuit()

    const inputs = { a: 20, b: 40 }

    // JS Proving
    const program = new Noir(noir_program)
    const { witness } = await program.execute(inputs)

    const backend = new UltraPlonkBackend(noir_program.bytecode)
    const proof = await backend.generateProof(witness)

    // JS verification
    const verified = await backend.verifyProof(proof)
    expect(verified, 'Proof fails verification in JS').to.be.true
  })
})