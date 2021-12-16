export interface RemixUiPublishToStorageProps {
  api: any,
  storage: 'swarm' | 'ipfs',
  contract: any,
  resetStorage: () => void
}
