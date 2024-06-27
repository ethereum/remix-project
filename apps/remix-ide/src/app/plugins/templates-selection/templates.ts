export const templates = (intl, plugin) => {
  return [
    {
      name: "Generic",
      items: [
        { value: "remixDefault", displayName: intl.formatMessage({ id: 'filePanel.basic' }) },
        { value: "blank", displayName: intl.formatMessage({ id: 'filePanel.blank' }) }
      ]
    },
    {
      name: "OpenZeppelin",
      items: [
        {
          value: "ozerc20",
          displayName: "ERC20",
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155"
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            mintable: true
          }
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            mintable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            mintable: true
          }
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            mintable: true,
            burnable: true
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            mintable: true,
            burnable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            mintable: true,
            burnable: true
          },
          tagList: ["ERC1155"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            mintable: true,
            pausable: true
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            mintable: true,
            pausable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            mintable: true,
            pausable: true
          }
        }
      ]
    },
    {
      name: "OpenZeppelin Proxy",
      items: [
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC1155"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC1155"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC1155"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC20"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC721"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC1155"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true,
            pausable: true
          },
          tagList: ["ERC1155"]
        }
      ]
    },
    {
      name: "Cookbook",
      tooltip: "Cookbook is a smart contract search tool. Click here to open cookbook and browse contracts.",
      onClick: () => {
        plugin.call('manager', 'activatePlugin', 'cookbookdev')
      },
      items: [
        { value: "token-sale", displayName: 'Token Sale' },
        { value: "simple-nft-sale", displayName: 'Simple Nft Sale' },
        { value: "Azuki-ERC721A-NFT-Sale-basic", displayName: 'Azuki ERC721A NFT Sale basic' },
        { value: "Azuki-ERC721A-ERC721A", displayName: 'Azuki ERC721A' },
        { value: "token-staking-with-infinite-rewards", displayName: 'Token Staking with infinite rewards' },
        { value: "nft-staking-with-infinite-rewards", displayName: 'Nft Staking with infinite rewards' },
        { value: "basic-dao", displayName: 'Basic DAO' },
        { value: "soulbound-nft", displayName: 'Soulbound Nft' },
        { value: "multi-collection-nft-with-burnable-nfts-and-pausable-transfers", displayName: 'Multi collection nft with burnable nfts and pausable transfers' },
      ]
    },
    {
      name: "OxProject",
      items: [
        { value: "zeroxErc20", displayName: "ERC20", tagList: ["ERC20"]}
      ]
    },
    {
      name: "Gnosis Safe",
      items: [
        { value: "gnosisSafeMultisig", displayName: intl.formatMessage({ id: 'filePanel.multiSigWallet' }) }
      ]
    },
    {
      name: "Circom ZKP",
      items: [
        { value: "semaphore", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.semaphore' }) },
        { value: "hashchecker", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.hashchecker' }) },
        { value: "rln", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.rln' }) }
      ]
    },
    {
      name: "Generic ZKP",
      items: [
        { value: "sindriScripts", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.addscriptsindri' }) },
      ],
    },
    {
      name: "Uniswap V4",
      items: [
        { value: "uniswapV4Template", displayName: intl.formatMessage({ id: 'filePanel.uniswapV4Template' }) },
        { value: "breakthroughLabsUniswapv4Hooks", displayName: intl.formatMessage({ id: 'filePanel.breakthroughLabsUniswapv4Hooks' }) },
        { value: "uniswapV4HookBookMultiSigSwapHook", displayName: intl.formatMessage({ id: 'filePanel.uniswapV4HookBookMultiSigSwapHook' }) }
      ]
    },
    {
      name: "Solidity CREATE2",
      items: [
        { value: "contractCreate2Factory", displayName: intl.formatMessage({ id: 'filePanel.addcreate2solidityfactory' }) },
        { value: "contractDeployerScripts", displayName: intl.formatMessage({ id: 'filePanel.addscriptdeployer' }) }
      ]
    },
    {
      name: "Contract Verification",
      items: [
        { value: "etherscanScripts", displayName: intl.formatMessage({ id: 'filePanel.addscriptetherscan' }) },
      ],
    },
    {
      name: 'Github Actions',
      items: [
        { value: "runJsTestAction", displayName: intl.formatMessage({ id: 'filePanel.tssoltestghaction' }) },
        { value: "runSolidityUnittestingAction", displayName: intl.formatMessage({ id: 'filePanel.tssoltestghaction' }) },
        { value: "runSlitherAction", displayName: intl.formatMessage({ id: 'filePanel.slitherghaction' }) }
      ],
      IsArtefact: true
    }
  ]
}