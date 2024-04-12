// eslint-disable-next-line @typescript-eslint/no-var-requires
const snarkjs = require('snarkjs');

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args)
};

(async () => {
  try {
    // @ts-ignore
    await remix.call('circuit-compiler', 'generateR1cs', 'circuits/semaphore.circom');

    const ptau_final = "https://ipfs-cluster.ethdevops.io/ipfs/QmTiT4eiYz5KF7gQrDsgfCSTRv3wBPYJ4bRN1MmTRshpnW";
    // @ts-ignore
    const r1csBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/semaphore.r1cs', { encoding: null });
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer);
    const zkey_final = { type: "mem" };

    console.log('plonk setup')
    await snarkjs.plonk.setup(r1cs, ptau_final, zkey_final)

    console.log('exportVerificationKey')
    const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
    await remix.call('fileManager', 'writeFile', './zk/keys/plonk/verification_key.json', JSON.stringify(vKey, null, 2))
    
    console.log('save zkey_final')
    // @ts-ignore
    await remix.call('fileManager', 'writeFile', './zk/keys/plonk/zkey_final.txt', (zkey_final as any).data, { encoding: null })
    
    console.log('setup done.')
    
  } catch (e) {
    console.error(e.message)
  }
})()