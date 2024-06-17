export abstract class AbstractVerifier {
  name: string
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string, name: string) {
    this.apiUrl = apiUrl
    this.name = name
    this.enabled = true
  }
}
