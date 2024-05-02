export const templates = (intl) => {
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
              displayName: "ERC20"
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)"
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
              }
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
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                mintable: true,
                burnable: true
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                mintable: true,
                burnable: true
              }
            },
            {
              value: "ozerc20",
              displayName: "ERC20",
              opts: {
                mintable: true,
                pausable: true
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                mintable: true,
                pausable: true
              }
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
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                upgradeable: 'uups'
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                upgradeable: 'uups'
              }
            },
            {
              value: "ozerc20",
              displayName: "ERC20",
              opts: {
                upgradeable: 'uups',
                mintable: true
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                upgradeable: 'uups',
                mintable: true
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                upgradeable: 'uups',
                mintable: true
              }
            },
            {
              value: "ozerc20",
              displayName: "ERC20",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                burnable: true
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                burnable: true
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                burnable: true
              }
            },
            {
              value: "ozerc20",
              displayName: "ERC20",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                pausable: true
              }
            },
            {
              value: "ozerc721",
              displayName: "ERC721 (NFT)",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                pausable: true
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                pausable: true
              }
            },
            {
              value: "ozerc1155",
              displayName: "ERC1155",
              opts: {
                upgradeable: 'uups',
                mintable: true,
                burnable: true,
                pausable: true
              }
            }
          ]
        },
        {
          name: "OxProject",
          items: [
            { value: "zeroxErc20", displayName: "ERC20" }
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
            { value: "semaphore", displayName: intl.formatMessage({ id: 'filePanel.semaphore' }) },
            { value: "hashchecker", displayName: intl.formatMessage({ id: 'filePanel.hashchecker' }) },
            { value: "rln", displayName: intl.formatMessage({ id: 'filePanel.rln' }) }
          ]
        },
        {
          name: "Generic ZKP",
          items: [
            { value: "sindriScripts", displayName: intl.formatMessage({ id: 'filePanel.addscriptsindri' }) },
          ]
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
          ]
        }
      ]
}