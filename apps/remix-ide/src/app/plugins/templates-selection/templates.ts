export const templates = (intl, plugin) => {
  return [
    {
      name: "Generic",
      items: [
        { value: "remixDefault", tagList: ["Solidity"], displayName: intl.formatMessage({ id: 'filePanel.basic' }), description: 'A default project' },
        { value: "blank", displayName: intl.formatMessage({ id: 'filePanel.blank' }), IsArtefact: true, description: 'A blank project' }
      ]
    },
    {
      name: "OpenZeppelin",
      items: [
        {
          value: "ozerc20",
          displayName: "ERC20",
          tagList: ["ERC20", "Solidity"],
          description: 'A simple ERC20 project'
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          tagList: ["ERC721", "Solidity"],
          description: 'A simple ERC721 (aka NFT) project'
        },
        {
          value: "ozerc1155",
          tagList: ["Solidity"],
          displayName: "ERC1155",
          description: 'A simple ERC1155 (multi token) project'
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          tagList: ["Solidity"],
          opts: {
            mintable: true
          }
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          tagList: ["Solidity", "ERC721"],
          opts: {
            mintable: true
          }
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          tagList: ["Solidity"],
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            mintable: true
          }
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          tagList: ["Solidity", "ERC20"],
          opts: {
            mintable: true,
            burnable: true
          },
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            mintable: true,
            burnable: true
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            mintable: true,
            burnable: true
          },
          tagList: ["ERC1155", "Solidity"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          opts: {
            mintable: true,
            pausable: true
          },
          tagList: ["ERC20", "Solidity"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            mintable: true,
            pausable: true
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          tagList: ["ERC20"],
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
          description: "A standard interface for fungible tokens",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC20", "Solidity"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            upgradeable: 'uups'
          },
          tagList: ["ERC1155", "Solidity"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC20", "Solidity"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            upgradeable: 'uups',
            mintable: true
          },
          tagList: ["ERC1155", "Solidity"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC20", "Solidity"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true
          },
          tagList: ["ERC1155", "Solidity"]
        },
        {
          value: "ozerc20",
          displayName: "ERC20",
          description: "A standard interface for fungible tokens",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC20", "Solidity"]
        },
        {
          value: "ozerc721",
          displayName: "ERC721 (NFT)",
          description: "Non-fungible Token Standard",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC721", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            pausable: true
          },
          tagList: ["ERC1155", "Solidity"]
        },
        {
          value: "ozerc1155",
          displayName: "ERC1155",
          description: "A standard interface for contracts that manage multiple token types",
          opts: {
            upgradeable: 'uups',
            mintable: true,
            burnable: true,
            pausable: true
          },
          tagList: ["ERC1155", "Solidity"]
        }
      ]
    },
    {
      name: "Cookbook",
      tooltip: "Cookbook is a smart contract search tool. Click here to open cookbook and browse contracts.",
      onClick: async () => {
        await plugin.call('manager', 'activatePlugin', 'cookbookdev')
        plugin.call('menuicons', 'showContent', 'cookbookdev')
      },
      onClickLabel: 'Open cookbook plugin',
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
        { value: "zeroxErc20", displayName: "ERC20", tagList: ["ERC20", "Solidity"], description: "A standard interface for fungible tokens by 0xProject" }
      ]
    },
    {
      name: "Gnosis Safe",
      items: [
        { value: "gnosisSafeMultisig", tagList: ["Solidity"], displayName: intl.formatMessage({ id: 'filePanel.multiSigWallet' }), description: 'Deploy or Customize the Gnosis Safe.' }
      ]
    },
    {
      name: "Circom ZKP",
      items: [
        { value: "semaphore", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.semaphore' }), description: 'Run a ZK Semaphore circom circuit.' },
        { value: "hashchecker", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.hashchecker' }), description: 'Run a ZK Hash checker circom circuit.' },
        { value: "rln", tagList: ["ZKP"], displayName: intl.formatMessage({ id: 'filePanel.rln' }), description: 'Run a Rate Limiting Nullifier circom circuit.' }
      ]
    },
    {
      name: "Generic ZKP",
      items: [
        {
          value: "sindriScripts",
          tagList: ["ZKP"],
          displayName: intl.formatMessage({ id: 'filePanel.addscriptsindri' }),
          description: 'Use the Sindri API to compile and generate proof.'
        },
      ],
    },
    {
      name: "Uniswap V4",
      items: [
        { value: "uniswapV4Template",
          displayName: intl.formatMessage({ id: 'filePanel.uniswapV4Template' }),
          description: 'Use an Uniswap hook'
        },
        {
          value: "breakthroughLabsUniswapv4Hooks",
          displayName: intl.formatMessage({ id: 'filePanel.breakthroughLabsUniswapv4Hooks' }),
          description: 'Use an Uniswap hook developed by Breakthrough Labs'
        },
        {
          value: "uniswapV4HookBookMultiSigSwapHook",
          displayName: intl.formatMessage({ id: 'filePanel.uniswapV4HookBookMultiSigSwapHook' }),
          description: 'Use a MultiSigSwapHook developed by Breakthrough Labs'
        }
      ]
    },
    {
      name: "Solidity CREATE2",
      items: [
        {
          value: "contractCreate2Factory",
          tagList: ["Solidity"],
          displayName: intl.formatMessage({ id: 'filePanel.addcreate2solidityfactory' }),
          description: 'Factory for deploying a Contract using the CREATE2 opcode.'
        },
        {
          value: "contractDeployerScripts",
          displayName: intl.formatMessage({ id: 'filePanel.addscriptdeployer' }),
          description: 'Script for deploying a Contract using the CREATE2 opcode.'
        }
      ]
    },
    {
      name: "Contract Verification",
      items: [
        {
          value: "etherscanScripts",
          displayName: intl.formatMessage({ id: 'filePanel.addscriptetherscan' }),
          description: 'Script for verifying a Contract in Etherscan.'
        },
      ],
    },
    {
      name: 'Github Actions',
      items: [
        { value: "runJsTestAction",
          displayName: intl.formatMessage({ id: 'filePanel.tssoltestghaction' }),
          description: 'A Mocha Chai Test Workflow in a GitHub CI.'
        },
        { value: "runSolidityUnittestingAction",
          displayName: intl.formatMessage({ id: 'filePanel.solghaction' }),
          description: 'Run a Solidity Unittest Workflow in a GitHub CI.'
        },
        {
          value: "runSlitherAction",
          displayName: intl.formatMessage({ id: 'filePanel.slitherghaction' }),
          description: 'Run a Slither Security Analysis in a GitHub CI.'
        }
      ],
      IsArtefact: true
    }
  ]
}