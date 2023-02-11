export interface ContentImport {
  content: any
  cleanUrl: string
  type: 'github' | 'http' | 'https' | 'swarm' | 'ipfs'
  url: string
}
