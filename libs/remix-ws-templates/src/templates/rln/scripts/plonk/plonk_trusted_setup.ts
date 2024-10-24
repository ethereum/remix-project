// eslint-disable-next-line @typescript-eslint/no-var-requires
const snarkjs = require('snarkjs');

(async () => {
  try {
    // @ts-ignore
    await remix.call('circuit-compiler', 'generateR1cs', 'circuits/rln.circom');

    const ptau_final = "https://ipfs-cluster.ethdevops.io/ipfs/QmciCq5JcZQyTLvC9GRanrLBi82ZmSriq1Fr5zANkGHebf";
    // @ts-ignore
    const r1csBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/rln.r1cs', { encoding: null });
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer);
    const zkey_final = { type: "mem" };

    console.log('plonk setup')
    await snarkjs.plonk.setup(r1cs, ptau_final, zkey_final)

    console.log('exportVerificationKey')
    const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)

    console.log('save zkey_final')
    // @ts-ignore
    await remix.call('fileManager', 'writeFile', 'scripts/plonk/zk/keys/zkey_final.txt', (zkey_final as any).data, { encoding: null })

    console.log('save verification key')
    await remix.call('fileManager', 'writeFile', 'scripts/plonk/zk/keys/verification_key.json', JSON.stringify(vKey, null, 2))

    console.log('setup done')
  } catch (e) {
    console.error(e.message)
  }
})()