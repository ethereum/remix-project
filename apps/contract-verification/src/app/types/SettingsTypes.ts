import { VerifierIdentifier } from './VerificationTypes'

export interface VerifierSettings {
  apiUrl?: string
  explorerUrl?: string
  apiKey?: string
  useV1API?: boolean // For Sourcify, whether to use the v1 API
  receiptsUrl?: string
}

export type SettingsForVerifier = Partial<Record<VerifierIdentifier, VerifierSettings>>

export interface ChainSettings {
  verifiers: SettingsForVerifier
}

export type SettingsForChains = Record<string, ChainSettings>

export interface ContractVerificationSettings {
  chains: SettingsForChains
}
