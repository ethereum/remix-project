export interface RemixUiPublishToStorageProps {
  id?: string
  api: any,
  storage: 'swarm' | 'ipfs',
  contract: any,
  resetStorage: () => void
}
