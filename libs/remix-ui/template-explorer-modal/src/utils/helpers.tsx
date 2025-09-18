// import { TEMPLATE_METADATA } from "@remix-ui/workspace"

export const templatesRepository = [
  {
    name: "Generic",
    items: [
      { value: "remixDefault", tagList: ["Solidity"],
        // displayName: intl.formatMessage({ id: 'filePanel.basic' }),
        description: 'The default project',
        // templateType: TEMPLATE_METADATA['remixDefault']
      },
      { value: "blank",
        // displayName: intl.formatMessage({ id: 'filePanel.blank' }),
        IsArtefact: true, description: 'A blank project',
        // templateType: TEMPLATE_METADATA['blank']
      },
      { value: "simpleEip7702", displayName: 'Simple EIP 7702', IsArtefact: true, description: 'Pectra upgrade allowing externally owned accounts (EOAs) to run contract code.',
        // templateType: TEMPLATE_METADATA['simpleEip7702']
      },
      { value: "accountAbstraction", displayName: 'Account Abstraction', IsArtefact: true, description: 'A repo about ERC-4337 and EIP-7702',
        // templateType: TEMPLATE_METADATA['accountAbstraction']
      },
      { value: 'remixAiTemplate', tagList: ['AI'], displayName: 'RemixAI Template Generation', IsArtefact: true, description: 'AI generated workspace. Workspace gets generated with a user prompt.',
        // templateType: TEMPLATE_METADATA['remixAiTemplate']
      },
      { value: "introToEIP7702", displayName: 'Intro to EIP-7702', IsArtefact: true, description: 'A contract for demoing EIP-7702',
        // templateType: TEMPLATE_METADATA['introToEIP7702']
      },
    ]
  },
  {
    name: "OpenZeppelin",
    hasOptions: true,
    items: [
      {
        value: "ozerc20",
        displayName: "ERC20",
        tagList: ["ERC20", "Solidity"],
        description: 'A customizable fungible token contract',
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "ERC20",
        description: "An ERC20 contract with:",
        tagList: ["Solidity"],
        opts: {
          mintable: true
        },
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "ERC20",
        description: "An ERC20 contract with:",
        tagList: ["Solidity", "ERC20"],
        opts: {
          mintable: true,
          burnable: true
        },
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "ERC20",
        description: "An ERC20 contract with:",
        opts: {
          mintable: true,
          pausable: true
        },
        tagList: ["ERC20", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc721",
        displayName: "ERC721 (NFT)",
        tagList: ["ERC721", "Solidity"],
        description: 'A customizable non-fungible token (NFT) contract',
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "ERC721 (NFT)",
        description: "An ERC721 contract with:",
        tagList: ["Solidity", "ERC721"],
        opts: {
          mintable: true
        },
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "ERC721 (NFT)",
        description: "An ERC721 contract with:",
        opts: {
          mintable: true,
          burnable: true
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "ERC721 (NFT)",
        description: "An ERC721 contract with:",
        opts: {
          mintable: true,
          pausable: true
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc1155",
        tagList: ["Solidity"],
        displayName: "ERC1155",
        description: 'A customizable multi token contract',
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "ERC1155",
        tagList: ["Solidity"],
        description: "An ERC1155 contract with:",
        opts: {
          mintable: true
        },
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "ERC1155",
        description: "An ERC1155 contract with:",
        opts: {
          mintable: true,
          burnable: true
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "ERC1155",
        description: "An ERC1155 contract with:",
        tagList: ["ERC1155"],
        opts: {
          mintable: true,
          pausable: true
        },
        // templateType: TEMPLATE_METADATA['ozerc1155']
      }
    ]
  },
  {
    name: "OpenZeppelin Proxy",
    items: [
      {
        value: "ozerc20",
        displayName: "UUPS ERC20",
        description: "A simple ERC20 contract using the Universal Upgradeable Proxy Standard (UUPS) pattern",
        opts: {
          upgradeable: 'uups'
        },
        tagList: ["ERC20", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "UUPS ERC20",
        description: "UUPS ERC20 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true
        },
        tagList: ["ERC20", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "UUPS ERC20",
        description: "UUPS ERC20 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          burnable: true
        },
        tagList: ["ERC20", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc20",
        displayName: "UUPS ERC20",
        description: "UUPS ERC20 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          pausable: true
        },
        tagList: ["ERC20", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc20']
      },
      {
        value: "ozerc721",
        displayName: "UUPS ERC721 (NFT)",
        description: "A simple UUPS ERC721 contract",
        opts: {
          upgradeable: 'uups'
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "UUPS ERC721 (NFT)",
        description: "UUPS ERC721 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "UUPS ERC721 (NFT)",
        description: "UUPS ERC721 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          burnable: true
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc721",
        displayName: "UUPS ERC721 (NFT)",
        description: "UUPS ERC721 contract with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          pausable: true
        },
        tagList: ["ERC721", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc721']
      },
      {
        value: "ozerc1155",
        displayName: "UUPS ERC1155",
        description: "A simple multi token contract using the UUPS pattern",
        opts: {
          upgradeable: 'uups'
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "UUPS ERC1155",
        description: "UUPS ERC1155 with:",
        opts: {
          upgradeable: 'uups',
          mintable: true
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "UUPS ERC1155",
        description: "UUPS ERC1155 with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          burnable: true
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "UUPS ERC1155",
        description: "UUPS ERC1155 with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          pausable: true
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      },
      {
        value: "ozerc1155",
        displayName: "UUPS ERC1155",
        description: "UUPS ERC1155 with:",
        opts: {
          upgradeable: 'uups',
          mintable: true,
          burnable: true,
          pausable: true
        },
        tagList: ["ERC1155", "Solidity"],
        // templateType: TEMPLATE_METADATA['ozerc1155']
      }
    ]
  },
  {
    name: "Cookbook",
    tooltip: "Cookbook is a Smart Contract Search Tool. Click here to open Cookbook and browse Contracts.",
    onClick: async () => {
      // await pluginCall('manager', 'activatePlugin', 'cookbookdev')
      // await pluginCall('sidePanel', 'focus', 'cookbookdev')
    },
    onClickLabel: 'Open Cookbook Plugin',
    description: 'Discover more templates!',
    items: [],
    /*         {
          value: "token-sale",
          displayName: 'Token Sale',
          description: "ERC20 token sale contact. Sell tokens for ETH"
        },
        {
          value: "simple-nft-sale",
          displayName: 'Simple Nft Sale',
          description: "ERC721 NFT with an adjustable price & to mint free NFTs"
        },
        {
          value: "Azuki-ERC721A-NFT-Sale-basic",
          displayName: 'Azuki ERC721A NFT Sale basic',
          description: "An implementation of the ERC721A standard"
        },
        {
          value: "Azuki-ERC721A-NFT-Sale",
          displayName: 'Azuki ERC721A NFT Sale',
          description: "An extension of the ERC721A standard with wallet limit"
        },
        {
          value: "token-staking-with-infinite-rewards",
          displayName: 'Token Staking with infinite rewards',
          description: "Token staking contract to reward ERC20 tokens for every token staked"
        },
        {
          value: "nft-staking-with-infinite-rewards",
          displayName: 'NFT Staking with infinite rewards',
          description: "NFT staking contract to reward exact number of ERC20 tokens per day"
        },
        {
          value: "basic-dao",
          displayName: 'Basic DAO',
          description: "A very simple implementation of a DAO"
        },
        {
          value: "soulbound-nft",
          displayName: 'Soulbound NFT',
          description: "ERC721 Soulbound NFT with no transfer capability"
        },
        { value: "multi-collection-nft-with-burnable-nfts-and-pausable-transfers",
          displayName: 'Multi collection NFT',
          description: "Multi collection NFT with:",
          opts: {
            burnable: true,
            pausable: true
          }, },
      ]*/
  },
  {
    name: "0xProject",
    items: [
      { value: "zeroxErc20", displayName: "ERC20", tagList: ["ERC20", "Solidity"], description: "A fungible token contract by 0xProject",
        // templateType: TEMPLATE_METADATA['zeroxErc20']
      }
    ]
  },
  {
    name: "Gnosis Safe",
    items: [
      { value: "gnosisSafeMultisig", tagList: ["Solidity"], // displayName: intl.formatMessage({ id: 'filePanel.multiSigWallet' }),
        description: 'Deploy or customize the Gnosis Safe MultiSig Wallet',
        // templateType: TEMPLATE_METADATA['gnosisSafeMultisig']
      }
    ]
  },
  {
    name: "Circom ZKP",
    items: [
      { value: "semaphore", tagList: ["ZKP", "Circom"], // displayName: intl.formatMessage({ id: 'filePanel.semaphore' }),
        description: 'Semaphore protocol for casting a message as a provable group member',
        // templateType: TEMPLATE_METADATA['semaphore']
      },
      { value: "hashchecker", tagList: ["ZKP", "Circom"], // displayName: intl.formatMessage({ id: 'filePanel.hashchecker' }),
        description: 'Hash checker Circom circuit',
        // templateType: TEMPLATE_METADATA['hashchecker']
      },
      { value: "rln", tagList: ["ZKP", "Circom"],
        //displayName: intl.formatMessage({ id: 'filePanel.rln' }),
        description: 'Rate Limiting Nullifier Circom circuit',
        // templateType: TEMPLATE_METADATA['rln']
      }
    ]
  },
  {
    name: "Noir ZKP",
    items: [
      { value: "multNr", tagList: ["ZKP", "Noir"], // displayName: intl.formatMessage({ id: 'filePanel.multNr' }),
        description: 'A simple multiplier circuit',
        // templateType: TEMPLATE_METADATA['multNr']
      }
      // { value: "stealthDropNr", tagList: ["ZKP", "Noir"], displayName: intl.formatMessage({ id: 'filePanel.stealthDropNr' }),}
    ]
  },
  {
    name: "Generic ZKP",
    items: [
      {
        value: "sindriScripts",
        tagList: ["ZKP"],
        // displayName: intl.formatMessage({ id: 'filePanel.addscriptsindri' }),
        description: 'Use the Sindri API to compile and generate proofs',
        // templateType: TEMPLATE_METADATA['sindriScripts']
      },
    ],
  },
  {
    name: "Uniswap V4",
    items: [
      { value: "uniswapV4Template",
        // displayName: intl.formatMessage({ id: 'filePanel.uniswapV4Template' }),
        description: 'Use a Uniswap hook',
        // templateType: TEMPLATE_METADATA['uniswapV4Template']
      },
      {
        value: "breakthroughLabsUniswapv4Hooks",
        // displayName: intl.formatMessage({ id: 'filePanel.breakthroughLabsUniswapv4Hooks' }),
        description: 'Use a Uniswap hook developed by Breakthrough Labs',
        // templateType: TEMPLATE_METADATA['breakthroughLabsUniswapv4Hooks']
      },
      {
        value: "uniswapV4HookBookMultiSigSwapHook",
        // displayName: intl.formatMessage({ id: 'filePanel.uniswapV4HookBookMultiSigSwapHook' }),
        description: 'Use a MultiSigSwapHook developed by Breakthrough Labs',
        // templateType: TEMPLATE_METADATA['uniswapV4HookBookMultiSigSwapHook']
      }
    ]
  },
  {
    name: "Solidity CREATE2",
    items: [
      {
        value: "contractCreate2Factory",
        tagList: ["Solidity"],
        // displayName: intl.formatMessage({ id: 'filePanel.addcreate2solidityfactory' }),
        description: 'Factory for deploying a contract using the CREATE2 opcode',
        // templateType: TEMPLATE_METADATA['contractCreate2Factory']
      },
      {
        value: "contractDeployerScripts",
        // displayName: intl.formatMessage({ id: 'filePanel.addscriptdeployer' }),
        description: 'Script for deploying a contract using the CREATE2 opcode',
        // templateType: TEMPLATE_METADATA['contractDeployerScripts']
      }
    ]
  },
  {
    name: "Contract Verification",
    items: [
      {
        value: "etherscanScripts",
        // displayName: intl.formatMessage({ id: 'filePanel.addscriptetherscan' }),
        description: 'Script for verifying a Contract in Etherscan',
        // templateType: TEMPLATE_METADATA['etherscanScripts']
      },
    ],
  },
  {
    name: 'GitHub Actions',
    items: [
      { value: "runJsTestAction",
        // displayName: intl.formatMessage({ id: 'filePanel.tssoltestghaction' }),
        description: 'A Mocha Chai test workflow in a GitHub CI',
        // templateType: TEMPLATE_METADATA['runJsTestAction']
      },
      { value: "runSolidityUnittestingAction",
        // displayName: intl.formatMessage({ id: 'filePanel.solghaction' }),
        description: 'Run a Solidity unit test workflow in a GitHub CI',
        // templateType: TEMPLATE_METADATA['runSolidityUnittestingAction']
      },
      {
        value: "runSlitherAction",
        // displayName: intl.formatMessage({ id: 'filePanel.slitherghaction' }),
        description: 'Run a Slither security analysis in a GitHub CI',
        // templateType: TEMPLATE_METADATA['runSlitherAction']
      }
    ],
    IsArtefact: true
  }
]

export const metadata = {
  'breakthroughLabsUniswapv4Hooks': {
    type: 'git',
    url: 'https://github.com/Breakthrough-Labs/Uniswapv4Hooks',
    branch: 'foundry_pure',
    forceCreateNewWorkspace: true
  },
  'accountAbstraction': {
    type: 'git',
    url: 'https://github.com/eth-infinitism/account-abstraction',
    branch: 'releases/v0.8',
    forceCreateNewWorkspace: true
  },
  'uniswapV4Template': {
    type: 'git',
    url: 'https://github.com/Breakthrough-Labs/v4-template',
    branch: 'main',
    forceCreateNewWorkspace: true
  },
  'uniswapV4HookBookMultiSigSwapHook': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openPattern',
    params: ['Uniswap-V4-HookBook-MultiSigSwapHook', true],
    forceCreateNewWorkspace: true,
    desktopCompatible: false,
    disabled: true
  },
  'token-sale': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['token-sale'],
    desktopCompatible: false
  },
  'simple-nft-sale': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['simple-nft-sale'],
    desktopCompatible: false
  },
  'Azuki-ERC721A-NFT-Sale': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['Azuki-ERC721A-NFT-Sale'],
    desktopCompatible: false
  },
  'Azuki-ERC721A-NFT-Sale-basic': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['Azuki-ERC721A-NFT-Sale-basic'],
    desktopCompatible: false
  },
  'Azuki-ERC721A-ERC721A': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['Azuki-ERC721A-ERC721A'],
    desktopCompatible: false
  },
  'token-staking-with-infinite-rewards': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['token-staking-with-infinite-rewards'],
    desktopCompatible: false
  },
  'nft-staking-with-infinite-rewards': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['nft-staking-with-infinite-rewards'],
    desktopCompatible: false
  },
  'basic-dao': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['basic-dao'],
    desktopCompatible: false
  },
  'soulbound-nft': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['soulbound-nft'],
    desktopCompatible: false
  },
  'multi-collection-nft-with-burnable-nfts-and-pausable-transfers': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openContract',
    params: ['multi-collection-nft-with-burnable-nfts-and-pausable-transfers'],
    desktopCompatible: false
  },
  'OpenSea-Seaport': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['OpenSea-Seaport'],
    desktopCompatible: false
  },
  'Ethereum-Name-Service': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Ethereum-Name-Service'],
    desktopCompatible: false
  },
  'Umbra-Cash': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Umbra-Cash'],
    desktopCompatible: false
  },
  'Aave-V3': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['Aave-V3'],
    desktopCompatible: false
  },
  'ChainLink': {
    type: 'plugin',
    name: 'cookbookdev',
    endpoint: 'openProtocol',
    params: ['ChainLink'],
    desktopCompatible: false
  }
}

// <RemixUIGridView
//   plugin={plugin}
//   styleList={""}
//   logo='assets/img/bgRemi.webp'
//   enableFilter={true}
//   showUntagged={true}
//   showPin={false}
//   tagList={[
//     ['Solidity', 'danger'],
//     ['ZKP', 'warning'],
//     ['ERC20', 'success'],
//     ['ERC721', 'secondary'],
//     ['ERC1155', 'primary'],
//   ]}
//   title='Workspace Templates'
//   description="Select a template to create a workspace or to add it to current workspace"
//   useInModal={true}
// >
//   {
//     templatesRepository.map(template => {
//       return (
//         <RemixUIGridSection
//           plugin={plugin}
//           key={template.name}
//           title={template.name}
//           tooltipTitle={template.tooltip}
//           hScrollable={false}
//         >
//           {
//             template.items.map((item, index) => {

//               item.templateType = metadata[item.value]
//               if (item.templateType && item.templateType.desktopCompatible === false && isElectron()) {
//                 return (<></>)
//               }

//               if (item.templateType && item.templateType.disabled === true) return

//               if (!item.opts) {
//                 return (
//                   <section className="border border-success" style={{ height: '190px', overflowY: 'auto' }}>
//                     <RemixUIGridCell
//                       // plugin={this}
//                       title={item.displayName}
//                       key={item.name || index}
//                       id={item.name}
//                       searchKeywords={[item.displayName, item.description, template.name]}
//                       tagList={item.tagList}
//                       classList={'TSCellStyle'}
//                     >
//                       <div className='d-flex justify-content-between h-100 flex-column'>
//                         <div className='d-flex flex-column'>
//                           <div>
//                             {item.description && <span className='text-dark'>{item.description}</span>}
//                           </div>
//                           <div className='d-flex flex-wrap mb-2'>
//                             {(item.opts && item.opts.upgradeable && item.opts.upgradeable === 'uups') && <span className='badgeForCell badge text-secondary'>Upgradeable-UUPS</span>}
//                             {(item.opts && item.opts.mintable) && <span className='badgeForCell text-secondary'>mintable</span>}
//                             {(item.opts && item.opts.burnable) && <span className='badgeForCell text-secondary'>burnable</span>}
//                             {(item.opts && item.opts.pausable) && <span className='badgeForCell text-secondary'>pausable</span>}
//                           </div>
//                         </div>
//                         <div className='align-items-center justify-content-between w-100 d-flex pt- flex-row'>
//                           {(!template.IsArtefact || !item.IsArtefact) && <CustomTooltip
//                             placement="auto"
//                             tooltipId={`overlay-tooltip-new${item.name}`}
//                             tooltipText="Create a new workspace"
//                           >
//                             <span
//                               data-id={`create-${item.value}${item.opts ? JSON.stringify(item.opts) : ''}`}
//                               onClick={async () => {
//                                 if ((item.value as string).toLowerCase().includes('ai')) {
//                                   // this.aiWorkspaceGenerate()
//                                 } else {
//                                   // createWorkspace(item, template)
//                                 }
//                               }}
//                               className="btn btn-sm me-2 border border-primary"
//                               data-template-name={item.name}
//                             >
//                               {isElectron() ?
//                                 <><i className='fa fa-folder-open me-1'></i>Create</> : 'Create'}
//                             </span>
//                           </CustomTooltip>}
//                           {item.templateType && item.templateType.forceCreateNewWorkspace ? <></> : isElectron() ?

//                             <div className=''>
//                               <CustomTooltip
//                                 placement="auto"
//                                 tooltipId={`overlay-tooltip-add${item.name}`}
//                                 tooltipText="Add template files to current workspace"
//                               >
//                                 <span
//                                   data-id={`add-${item.value}`}
//                                   // onClick={async () => addToCurrentElectronFolder(item, template.name)}
//                                   className="btn btn-sm border"
//                                 >
//                                   <i className="fa fa-folder-plus me-1" aria-hidden="true"></i>
//                              Add here
//                                 </span>
//                               </CustomTooltip>
//                             </div>
//                             :
//                             <CustomTooltip
//                               placement="auto"
//                               tooltipId={`overlay-tooltip-add${item.name}`}
//                               tooltipText="Add template files to current workspace"
//                             >
//                               <span
//                                 data-id={`add-${item.value}`}
//                                 // onClick={async () => addToCurrentWorkspace(item, template)}
//                                 className="btn btn-sm border"
//                               >
//                             Add to current
//                               </span>
//                             </CustomTooltip>}
//                         </div>
//                       </div>
//                     </RemixUIGridCell>
//                   </section>
//                 ) // end return
//               } // end if
//             }) // end map
//           }
//           {template.name === 'Cookbook' && <RemixUIGridCell
//             // plugin={this}
//             title={"More from Cookbook"}
//             key={"cookbookMore"}
//             id={"cookBookMore"}
//             searchKeywords={["cookbook"]}
//             tagList={[]}
//             classList='TSCellStyle'
//           >
//             <div className='d-flex justify-content-between h-100 flex-column'>
//               <span className='pt-2 px-1 h6 text-dark'>{template.description}</span>
//               <span style={{ cursor: 'pointer' }} className='mt-2 mb-1 btn btn-sm border align-items-left' onClick={() => template.onClick()}>{template.onClickLabel}</span>
//             </div>
//           </RemixUIGridCell>}
//         </RemixUIGridSection>
//       )
//     })
//   }
// </RemixUIGridView>
