import { prove } from './utils'

// You must modify the input signals to include the data you're trying to generate a proof for.
const signals: {[name: string]: number | string} = {}

const main = async () => {
  if (Object.keys(signals).length === 0) {
    console.error("You must modify the input signals to include the data you're trying to generate a proof for.")
    return
  }
  const proofResponse = await prove(signals)
  console.log('Proof:\n', JSON.stringify(proofResponse.proof, null, 2))
}

main()
