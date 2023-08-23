export default async () => {
  return {
    "contracts/SampleERC20.sol": // @ts-ignore
    (await import("raw-loader!./contracts/SampleERC20.sol")).default,
    "scripts/deploy_with_ethers.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/deploy_with_ethers.ts")).default,
    "scripts/deploy_with_web3.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/deploy_with_web3.ts")).default,
    "scripts/ethers-lib.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/ethers-lib.ts")).default,
    // @ts-ignore
    "scripts/web3-lib.ts": (await import("!!raw-loader!./scripts/web3-lib.ts"))
      .default,
    "tests/SampleERC20_test.sol": // @ts-ignore
    (await import("raw-loader!./tests/SampleERC20_test.sol")).default,
    // @ts-ignore
    ".prettierrc.json": (await import("raw-loader!./.prettierrc")).default,
  };
};
