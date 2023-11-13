;(async () => {
    try {
        remix.off('solidity', 'compilationFinished')
        const params = {
            optimize: true,
            runs: 200,
            language: 'Solidity',
            version: '0.8.4+commit.c7e474f2',
        }
        await remix.call('solidity', 'setCompilerConfig', params as any)
        await remix.call('solidity', 'compile' as any, 'semaphore/contracts/Semaphore.sol')
    }catch(e){
        console.log(e.message)
    }
})()
