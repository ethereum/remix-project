export default async () => {
    return {
        // @ts-ignore
        'contracts/SampleERC721.sol': (await import('raw-loader!./contracts/SampleERC721.sol')).default,
        // @ts-ignore
        'scripts/deploy_with_ethers.ts': (await import('!!raw-loader!./scripts/deploy_with_ethers.ts')).default,
        // @ts-ignore
        'scripts/deploy_with_web3.ts': (await import('!!raw-loader!./scripts/deploy_with_web3.ts')).default,
        // @ts-ignore
        'scripts/ethers.ts': (await import('!!raw-loader!./scripts/ethers.ts')).default,
        // @ts-ignore
        'scripts/web3.ts': (await import('!!raw-loader!./scripts/web3.ts')).default,
        // @ts-ignore
        'tests/SampleERC721_test.sol': (await import('raw-loader!./tests/SampleERC721_test.sol')).default
    }
}