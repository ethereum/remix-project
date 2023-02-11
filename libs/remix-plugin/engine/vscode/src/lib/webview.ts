import { PluginConnector, PluginConnectorOptions} from '@remixproject/engine'
import { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils'
import { ExtensionContext, ViewColumn, Webview, WebviewPanel, window, Uri, Disposable, workspace, env } from 'vscode'
import { join, isAbsolute, parse as parsePath } from 'path'
import { promises as fs, watch } from 'fs'
import { parse as parseUrl } from 'url'


interface WebviewOptions extends PluginConnectorOptions {
  /** Extension Path */
  context: ExtensionContext
  relativeTo?: 'workspace' | 'extension'
  column?: ViewColumn
  devMode?: boolean
}

export class WebviewPlugin extends PluginConnector {
  private listeners: Disposable[] = [];
  panel?: WebviewPanel
  options: WebviewOptions

  constructor(profile: Profile & ExternalProfile, options: WebviewOptions) {
    super(profile)
    options.engine = 'vscode'
    this.setOptions(options)
  }

  setOptions(options: Partial<WebviewOptions>) {
    super.setOptions(options)
  }

  protected send(message: Partial<Message>): void {
    this.panel?.webview.postMessage(message)
  }

  protected async connect(url: string): Promise<void> {
    if (this.options.context) {
      this.panel = await createWebview(this.profile, url, this.options)
      this.listeners = [
        this.panel.webview.onDidReceiveMessage(msg => this.getMessage(msg)),
        this.panel.onDidDispose(_ => this.call('manager', 'deactivatePlugin', this.name)),
        this.panel,
      ]
    } else {
      throw new Error(`WebviewPlugin "${this.name}" `)
    }
  }

  async getMessage(message: Message) {
    if(message.action == 'emit' && message.payload.href){
      env.openExternal(Uri.parse(message.payload.href))
    }else
    super.getMessage(message)
  }

  protected disconnect(): void {
    this.listeners.forEach(disposable => disposable.dispose());
  }

}

function isHttpSource(protocol: string) {
  return protocol === 'https:' || protocol === 'http:'
}

/** Create a webview */
export async function createWebview(profile: Profile, url: string, options: WebviewOptions) {
  const { protocol, path } = parseUrl(url)
  const isRemote = isHttpSource(protocol)

  if (isRemote) {
    return await getWebviewContent(url, profile, options)
  } else {
    const relativeTo = options.relativeTo || 'extension';
    let fullPath: string;
    if (isAbsolute(path)) {
      fullPath = path
    } else if (relativeTo === 'extension') {
      const { extensionPath } = options.context;
      fullPath = join(extensionPath, path);
    } else if (relativeTo === 'workspace') {
      const root = workspace.workspaceFolders[0]?.uri.fsPath;
      if (!root) {
        throw new Error('No open workspace. Cannot find url of relative path: ' + path)
      }
      fullPath = join(root, path);
    }
    return localHtml(fullPath, profile, options)
  }
}

///////////////
// LOCAL URL //
///////////////
/** Create panel webview based on local HTML source */
function localHtml(url: string, profile: Profile, options: WebviewOptions) {
  const { ext } = parsePath(url)
  const baseUrl = ext === '.html' ? parsePath(url).dir : url

  const panel = window.createWebviewPanel(
    profile.name,
    profile.displayName || profile.name,
    options.column || window.activeTextEditor?.viewColumn || ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [Uri.file(baseUrl)]
    }
  )
  setLocalHtml(panel.webview, baseUrl)

  // Devmode
  if (options.devMode) {
    const index = join(baseUrl, 'index.html')
    watch(index).on('change', _ => setLocalHtml(panel.webview, baseUrl))
  }
  return panel
}

/** Get code from local source */
async function setLocalHtml(webview: Webview, baseUrl: string) {
  const index = `${baseUrl}/index.html`

  // Get all links from "src" & "href"
  const matchLinks = /(href|src)="([^"]*)"/g

  // Vscode requires URI format from the extension root to work
  const toUri = (original: any, prefix: 'href' | 'src', link: string) => {
    // For: <base href="#" /> && remote url : <link href="https://cdn..."/>
    const isRemote = isHttpSource(parseUrl(link).protocol)
    if (link === '#' || isRemote) {
      return original
    }
    // For scripts & links
    const path = join(baseUrl, link)
    const uri = Uri.file(path)
    return `${prefix}="${webview['asWebviewUri'](uri)}"`
  }

  const html = await fs.readFile(index, 'utf-8')
  webview.html = html.replace(matchLinks, toUri)
}

///////////////
// REMOTE URL //
///////////////
async function getWebviewContent(url: string, profile: Profile, options: WebviewOptions) {
  // Use asExternalUri to get the URI for the web server
  const uri = Uri.parse(url);
  const serverUri = await env.asExternalUri(uri);

  // Create the webview
  const panel = window.createWebviewPanel(
    profile.name,
    profile.displayName || profile.name,
    options.column || window.activeTextEditor?.viewColumn || ViewColumn.One,
    {
      enableScripts: true
    }
  );

  const cspSource = panel.webview.cspSource;
  const content = {
    'default-src': `none 'unsafe-inline'`,
    'frame-src': `${serverUri} ${cspSource} https`,
    'img-src': `${cspSource} https:`,
    'script-src': `${cspSource} ${serverUri} 'unsafe-inline'`,
    'style-src': `${cspSource} ${serverUri} 'unsafe-inline'`,
  };
  const contentText = Object.entries(content).map(([key, value]) => `${key} ${value}`).join(';')
  panel.webview.html = `
    <!DOCTYPE html>
    <head>
      <meta http-equiv="Content-Security-Policy" content="${contentText}" />
    </head>
    <body  style='padding:0px; position:absolute; width:100%; height:100%;'>
    </body>

    <script>
      const vscode = acquireVsCodeApi();
      const pframe = document.createElement('iframe')
      // forward messages

        window.addEventListener('paste', function (evt) {
            pframe.contentWindow.postMessage({action:"paste", data:evt.clipboardData.getData('text/plain')},'${serverUri}');
        });

        window.addEventListener('copy', function (evt) {
            pframe.contentWindow.postMessage({action:"copy"},'${serverUri}');
        });  

        window.addEventListener('message', event => {
            if (event.origin.indexOf('vscode-webview:')>-1) {
                // Else extension -> webview
                pframe.contentWindow.postMessage(event.data, '${serverUri}');
            } else {
                // If iframe -> webview
                if(event.data.action == 'keydown'){
                    // incoming keyboard event
                    if(navigator.platform.toLowerCase().indexOf('mac') === 0)
                        window.dispatchEvent(new KeyboardEvent('keydown', event.data));
                }else if(event.data.action == 'copy'){
                    // put data in clipboard
                    if(navigator.platform.toLowerCase().indexOf('mac') === 0){
                        navigator.permissions.query({name: "clipboard-write"}).then(result => {
                            if (result.state == "granted" || result.state == "prompt") {
                              navigator.clipboard.writeText(event.data.data)
                            }
                        });
                    }  
                }else{
                    // forward message to vscode extension
                    vscode.postMessage(event.data)
                }
            }
      });
      
      pframe.setAttribute('sandbox', 'allow-popups allow-scripts allow-same-origin allow-downloads allow-forms allow-top-navigation')
      pframe.setAttribute('seamless', 'true')
      pframe.src = '${serverUri}?r=${Math.random()}'
      pframe.setAttribute('id', 'plugin-${profile.name}')
      document.body.appendChild(pframe);
      pframe.setAttribute('style', 'height: 100%; width: 100%; border: 0px; display: block;')
    </script>
    </html>`;
  return panel
}
