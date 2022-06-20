export const generateContractMetadataText = 'Generate contract metadata. Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.'
export const textSecondary = 'text-secondary'
export const textDark = 'text-dark'
export const warnText = 'Be sure the endpoint is opened before enabling it. \nThis mode allows a user to provide a passphrase in the Remix interface without having to unlock the account. Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...). Remix never persists any passphrase'.split('\n').map(s => s.trim()).join(' ')

export const gitAccessTokenTitle = 'GitHub Access Token'
export const gitAccessTokenText = 'Manage the access token used to publish to Gist and retrieve GitHub contents.'
export const gitAccessTokenText2 = 'Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only \'create gist\' permission.'
export const gitAccessTokenLink = 'https://github.com/settings/tokens'
export const etherscanTokenTitle = 'EtherScan Access Token'
export const etherscanTokenLink = 'https://etherscan.io/myapikey'
export const etherscanAccessTokenText = 'Manage the api key used to interact with Etherscan.'
export const etherscanAccessTokenText2 = 'Go to Etherscan api key page (link below) to create a new api key and save it in Remix.'
export const ethereunVMText = 'Always use Javascript VM at load'
export const wordWrapText = 'Word wrap in editor'
export const enablePersonalModeText = ' Enable Personal Mode for web3 provider. Transaction sent over Web3 will use the web3.personal API.\n'
export const matomoAnalytics = 'Enable Matomo Analytics. We do not collect personally identifiable information (PII). The info is used to improve the site’s UX & UI. See more about '
export const swarmSettingsTitle = 'Swarm Settings'
export const swarmSettingsText = 'Swarm Settings'
export const ipfsSettingsText = 'IPFS Settings'
export const labels = {
    'gist': {
        'link': gitAccessTokenLink,
        'title': gitAccessTokenTitle,
        'message1': gitAccessTokenText,
        'message2': gitAccessTokenText2,
        'key': 'gist-access-token'
    },
    'etherscan': {
        'link': etherscanTokenLink,
        'title': etherscanTokenTitle,
        'message1':etherscanAccessTokenText,
        'message2':etherscanAccessTokenText2,
        'key': 'etherscan-access-token'
    }
}
