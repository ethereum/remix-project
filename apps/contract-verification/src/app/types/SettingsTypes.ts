import { VerifierIdentifier } from './VerificationTypes'

export interface VerifierSettings {
  apiUrl?: string
  explorerUrl?: string
  apiKey?: string
}

export type SettingsForVerifier = Partial<Record<VerifierIdentifier, VerifierSettings>>

export interface ChainSettings {
  verifiers: SettingsForVerifier
}

export type SettingsForChains = Record<string, ChainSettings>

export interface ContractVerificationSettings {
  chains: SettingsForChains
}
