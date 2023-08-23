import { erc20 } from "@openzeppelin/wizard";

export default async (opts) => {
  if (opts) {
    erc20.defaults.mintable = opts.mintable;
    erc20.defaults.burnable = opts.burnable;
    erc20.defaults.pausable = opts.pausable;
  }

  const filesObj = {
    "contracts/MyToken.sol": erc20.print({
      ...erc20.defaults,
      upgradeable: opts && opts.upgradeable ? opts.upgradeable : false,
    }),
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

  // If no options is selected, opts.upgradeable will be undefined
  // We do not show test file for upgradeable contract

  if (!opts || opts.upgradeable === undefined || !opts.upgradeable) {
    if (erc20.defaults.mintable)
      filesObj["tests/MyToken_test.sol"] = // @ts-ignore
      (await import("raw-loader!./tests/MyToken_mintable_test.sol")).default;
    else
      filesObj["tests/MyToken_test.sol"] = // @ts-ignore
      (await import("raw-loader!./tests/MyToken_test.sol")).default;
  }
  return filesObj;
};
