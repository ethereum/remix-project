export default async () => {
  return {
    "contracts/MultisigWallet.sol": // @ts-ignore
    (await import("raw-loader!./contracts/MultisigWallet.sol")).default,
    "scripts/deploy_with_ethers.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/deploy_with_ethers.ts")).default,
    "scripts/deploy_with_web3.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/deploy_with_web3.ts")).default,
    "scripts/ethers-lib.ts": // @ts-ignore
    (await import("!!raw-loader!./scripts/ethers-lib.ts")).default,
    // @ts-ignore
    "scripts/web3-lib.ts": (await import("!!raw-loader!./scripts/web3-lib.ts"))
      .default,
    // @ts-ignore
    ".prettierrc.json": (await import("raw-loader!./.prettierrc")).default,
  };
};
