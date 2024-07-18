import type { ChainSettings, ContractVerificationSettings, SettingsForVerifier, VerifierSettings } from './SettingsTypes'
import { VERIFIERS } from './VerificationTypes'

const DEFAULTS: SettingsForVerifier = {
  Sourcify: {
    apiUrl: 'https://sourcify.dev/server/',
    explorerUrl: 'https://repo.sourcify.dev/',
  },
  Etherscan: {
    apiUrl: 'https://api.etherscan.io/',
    explorerUrl: 'https://etherscan.io/',
    apiKey: undefined,
  },
  Blockscout: {
    apiUrl: 'https://eth.blockscout.com/',
  },
}

export function getSettingsForChain(chainId: string, userSettings: ContractVerificationSettings): ChainSettings {
  const verifiers: SettingsForVerifier = {}

  for (const verifierId in VERIFIERS) {
    const userSetting: VerifierSettings = userSettings.chains[chainId]?.verifiers[verifierId]

    if (userSetting) {
      verifiers[verifierId] = { ...userSetting }
      // Only apply default settings for Etherscan and Blockscout on mainnet
      if (verifierId === 'Sourcify' || chainId === '1') {
        for (const key of Object.keys(DEFAULTS[verifierId])) {
          if (!verifiers[verifierId][key]) {
            verifiers[verifierId][key] = DEFAULTS[verifierId][key]
          }
        }
      }
      // Only apply default settings for Etherscan and Blockscout on mainnet
    } else if (verifierId === 'Sourcify' || chainId === '1') {
      verifiers[verifierId] = DEFAULTS[verifierId]
    }
  }
  return { verifiers }
}
