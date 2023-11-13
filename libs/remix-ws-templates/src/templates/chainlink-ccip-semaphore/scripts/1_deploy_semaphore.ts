import { deploy } from './helpers/deploy'
;(async () => {
    try {
        const pairing = await deploy('Pairing', [])

        console.log(pairing.address)

        const verifier = await deploy('SemaphoreVerifier', [], {
            Pairing: pairing.address,
        })

        const verifierAddress = verifier.address

        const poseidonT3 = await deploy('PoseidonT3', [])
        console.log('PoseidonT3 at', poseidonT3.address)

        const incrementalBinaryTree = await deploy('IncrementalBinaryTree', [], {
            'poseidon-solidity/PoseidonT3.sol:PoseidonT3': poseidonT3.address,
        })
        console.log('IncrementalBinaryTree at', incrementalBinaryTree.address)

        if (!verifierAddress) throw new Error("verifier address shouldn't be null, the semaphore needs it...")
        const semaphore = await deploy('Semaphore', [verifierAddress], {
            IncrementalBinaryTree: incrementalBinaryTree.address,
        })
        console.log('Semaphore addres: ', semaphore.address)

        await remix.call(
            'fileManager',
            'setFile',
            './data/semaphore_deployment.json',
            JSON.stringify(
                {
                    semaphoreAddress: semaphore.address,
                    verifierAddress,
                },
                null,
                '\t',
            ),
        )

        await remix.call('solidity', 'compile' as any, 'contracts/hackergroup.sol')
        await remix.call('solidity', 'compile' as any, 'contracts/hackerClient.sol')
    } catch (e) {
        console.error(e.message)
    }
})()
