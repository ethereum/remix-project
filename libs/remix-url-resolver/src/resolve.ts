import axios, { AxiosResponse } from 'axios'

export interface Imported {
  content: string;
  cleanURL: string;
  type: string;
}

interface PreviouslyHandledImports {
  [filePath: string]: Imported
}

interface Handler {
  type: string;
  match(url: string): any;
  handle(match: any): any;
}

interface HandlerResponse {
  content: any;
  cleanUrl: string
}

export class RemixURLResolver {
  private previouslyHandled: PreviouslyHandledImports
  gistAccessToken: string

  constructor(gistToken?: string) {
    this.previouslyHandled = {}
    this.gistAccessToken = gistToken ? gistToken : ''
  }

  /**
  * Handle an import statement based on github
  * @param root The root of the github import statement
  * @param filePath path of the file in github
  */
  async handleGithubCall(root: string, filePath: string): Promise<HandlerResponse> {
    let param = '?'
    param += this.gistAccessToken ? 'access_token=' + this.gistAccessToken : ''
    const regex = filePath.match(/blob\/([^/]+)\/(.*)/)
    if (regex) {
      // if we have /blob/master/+path we extract the branch name "master" and add it as a parameter to the github api
      // the ref can be branch name, tag, commit id
      const reference = regex[1]
      param += '&ref=' + reference
      filePath = filePath.replace(`blob/${reference}/`, '')
    }
    //eslint-disable-next-line no-useless-catch
    try {
      const req: string = 'https://api.github.com/repos/' + root + '/contents/' + filePath + param
      const response: AxiosResponse = await axios.get(req)
      return { content: Buffer.from(response.data.content, 'base64').toString(), cleanUrl: root + '/' + filePath }
    } catch(e) {
      throw e
    }
  }

  /**
  * Handle an import statement based on http
  * @param url The url of the import statement
  * @param cleanUrl
  */
  async handleHttp(url: string, cleanUrl: string): Promise<HandlerResponse> {
    //eslint-disable-next-line no-useless-catch
    try {
      const response: AxiosResponse = await axios.get(url)
      return { content: response.data, cleanUrl}
    } catch(e) {
      throw e
    }
  }

  /**
  * Handle an import statement based on https
  * @param url The url of the import statement
  * @param cleanUrl
  */
  async handleHttps(url: string, cleanUrl: string): Promise<HandlerResponse> {
    //eslint-disable-next-line no-useless-catch
    try {
      const response: AxiosResponse = await axios.get(url)
      return { content: response.data, cleanUrl }
    } catch(e) {
      throw e
    }
  }

  handleSwarm(url: string, cleanUrl: string) {
    return
  }

  /**
  * Handle an import statement based on IPFS
  * @param url The url of the IPFS import statement
  */
  async handleIPFS(url: string): Promise<HandlerResponse> {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')
    //eslint-disable-next-line no-useless-catch
    try {
      const req = 'https://gateway.ipfs.io/' + url
      // If you don't find greeter.sol on ipfs gateway use local
      // const req = 'http://localhost:8080/' + url
      const response: AxiosResponse = await axios.get(req)
      return { content: response.data, cleanUrl: url }
    } catch (e) {
      throw e
    }
  }

  getHandlers(): Handler[] {
    return [
      {
        type: 'github',
        match: (url) => { return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url) },
        handle: (match) => this.handleGithubCall(match[3], match[4])
      },
      {
        type: 'http',
        match: (url) => { return /^(http?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttp(match[1], match[2])
      },
      {
        type: 'https',
        match: (url) => { return /^(https?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttps(match[1], match[2])
      },
      {
        type: 'swarm',
        match: (url) => { return /^(bzz-raw?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleSwarm(match[1], match[2])
      },
      {
        type: 'ipfs',
        match: (url) => { return /^(ipfs:\/\/?.+)/.exec(url) },
        handle: (match) => this.handleIPFS(match[1])
      }
    ]
  }

  public async resolve(filePath: string, customHandlers?: Handler[]): Promise<Imported> {
    let imported: Imported = this.previouslyHandled[filePath]
    if(imported) {
      return imported
    }
    const builtinHandlers: Handler[] = this.getHandlers()
    const handlers: Handler[] = customHandlers ? [...builtinHandlers, ...customHandlers] : [...builtinHandlers]
    const matchedHandler = handlers.filter(handler => handler.match(filePath))
    const handler: Handler = matchedHandler[0]
    const match = handler.match(filePath)
    const content: string = await handler.handle(match)
    imported = {
      content,
      cleanURL: filePath,
      type: handler.type
    }
    this.previouslyHandled[filePath] = imported
    return imported
  }
}
