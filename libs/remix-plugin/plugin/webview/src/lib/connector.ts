import type { Message, Api, ApiMap, PluginApi } from '@remixproject/plugin-utils'
import {
  ClientConnector,
  connectClient,
  applyApi,
  PluginClient,
  isHandshake,
  PluginOptions,
  checkOrigin,
  isPluginMessage
} from '@remixproject/plugin'
import { IRemixApi, Theme } from '@remixproject/plugin-api';
import axios from 'axios'


/** Transform camelCase (JS) text into kebab-case (CSS) */
function toKebabCase(text: string) {
  return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

declare global {
  function acquireTheiaApi(): any;
}


/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  source: { postMessage: (message: any, origin?: string) => void }
  origin: string
  isVscode: boolean

  constructor(private options: PluginOptions<any>) {
    // @todo(#295) check if we can merge this statement in `this.isVscode = acquireVsCodeApi !== undefined`
    try {
      this.isVscode = acquireTheiaApi !== undefined
      this.source = acquireTheiaApi()
      return
    } catch (e) {
      this.isVscode = false
    }
    // fallback to window parent (iframe)
    this.source = window.parent
  }


  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.isVscode) {
      this.source.postMessage(message)
    } else if (this.origin || isHandshake(message)) {
      const origin = this.origin || '*'
      this.source.postMessage(message, origin)
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    window.addEventListener('message', async (event: MessageEvent) => {
      if (!event.source) return
      if (!event.data) return
      // copy paste events from vscode
      if (event.origin.indexOf('vscode-webview:') > -1) {
        if (event.data.action && event.data.action === 'paste') {
            this.pasteClipBoard(event);
            return;
        }
        if (event.data.action && event.data.action === 'copy') {
            const selection = document.getSelection();
            const event = {
                action: 'copy',
                data: selection.toString()
            }
            window.parent.postMessage(event, '*')
            return;
        }
      }
      // plugin messages
      if (!isPluginMessage(event.data)) return
      // Support for iframe
      if (!this.isVscode) {
        // Check that the origin is the right one (if any defined in the options)
        const isGoodOrigin = await checkOrigin(event.origin, this.options)
        if (!isGoodOrigin) return console.warn('Origin provided is not allow in message', event)
        if (isHandshake(event.data)) {
          this.origin = event.origin
          this.source = event.source as Window
          if(event.data.payload[1] && event.data.payload[1] == 'vscode') this.forwardEvents()
        }
      }
      cb(event.data)

    }, false)
  }

  // vscode specific, webview iframe requires forwarding of keyboard events & links clicked 
  pasteClipBoard(event) {
    this.insertAtCursor(document.activeElement, event.data.data);
  }

  insertAtCursor(element:any, value:any) {
      const lastValue:any = element.value;
      if (element.selectionStart || element.selectionStart == '0') {
          element.value = element.value.substring(0, element.selectionStart)
              + value
              + element.value.substring(element.selectionEnd, element.value.length);
      } else {
          element.value += value;
      }
      // this takes care of triggering the change on React components
      const event:any = new Event('input', { bubbles: true });
      event.simulated = true;
      const tracker:any = element._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      element.dispatchEvent(event);
  }
  forwardEvents(){
    document.addEventListener('keydown', e => {
        const obj = {
            altKey: e.altKey,
            code: e.code,
            ctrlKey: e.ctrlKey,
            isComposing: e.isComposing,
            key: e.key,
            location: e.location,
            metaKey: e.metaKey,
            repeat: e.repeat,
            shiftKey: e.shiftKey,
            action: 'keydown'
        }
        window.parent.postMessage( obj, '*')
    })
    document.body.onclick = function (e:any) {
      const closest = e.target?.closest("a");
      if (closest) {
          const href = closest.getAttribute('href');
          if (href != '#') {
              window.parent.postMessage({
                  action: 'emit',
                  payload: {
                      href: href,
                  },
              }, '*');
              return false;
          }
      }
      return true;
    };
  }
}

/**
 * Connect a Webview plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createClient = <
  P extends Api = any,
  App extends ApiMap = Readonly<IRemixApi>,
  C extends PluginClient<P, App> = any
>(client: C): C & PluginApi<App> => {
  const c = client as any || new PluginClient<P, App>()
  const options = c.options
  const connector = new WebviewConnector(options)
  connectClient(connector, c)
  applyApi(c)
  if (!options.customTheme) {
    listenOnThemeChanged(c)
  }
  return c as any
}

/** Set the theme variables in the :root */
function applyTheme(theme: Theme) {
  const brightness = theme.brightness || theme.quality;
  document.documentElement.style.setProperty(`--brightness`, brightness);
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      document.documentElement.style.setProperty(`--${toKebabCase(key)}`, value);
    }
  }
  if (theme.breakpoints) {
    for (const [key, value] of Object.entries(theme.breakpoints)) {
      document.documentElement.style.setProperty(`--breakpoint-${key}`, `${value}px`);
    }
  }
  if (theme.fontFamily) {
    document.documentElement.style.setProperty(`--font-family`, theme.fontFamily);
  }
  if (theme.space) {
    document.documentElement.style.setProperty(`--space`, `${theme.space}px`);
  }
}

/** Start listening on theme changed */
async function listenOnThemeChanged(client: PluginClient) {
  let cssLink: HTMLLinkElement;
  // Memorized the css link but only create it when needed
  const getLink = () => {
    if (!cssLink) {
      cssLink = document.createElement('link')
      cssLink.setAttribute('rel', 'stylesheet')
      document.head.prepend(cssLink)
    }
    return cssLink;
  }

  const setAttribute = (url, backupUrl = null) => {
    // there is no way to know if it will load unless it's loaded first
    axios.get(url).then(() => {
        getLink().setAttribute('href', url);
    }).catch(() => {
        if(backupUrl) getLink().setAttribute('href', backupUrl);
    });
  }

  // If there is a url in the theme, use it
  const setLink = (theme: Theme) => {
    if (theme.url) {
      const url = theme.url.replace(/^http:/, "protocol:").replace(/^https:/, "protocol:");
      const regexp = /^https:/;
      const httpsUrl = url.replace(/^protocol:/, "https:");
      const httpUrl = url.replace(/^protocol:/, "http:") 
      
      // if host is https, https will always work
      // if host is http, but plugin is https, try both but first https, http will always fail if https css is not found
      // if host is localhost, https plugins can load http resource but will throw error for https first
      if (regexp.test(theme.url) || (!regexp.test(theme.url) && regexp.test(window.location.href))) {
          setAttribute(httpsUrl, httpUrl);
      }
      // both are http load http, ie localhost 
      if (!regexp.test(theme.url) && !regexp.test(window.location.href)) {
          setAttribute(httpUrl);
      }
      document.documentElement.style.setProperty('--theme', theme.quality)
    }
  }

  client.onload(async () => {
    // On Change
    client.on('theme', 'themeChanged', (theme: Theme) => {
      setLink(theme);
      applyTheme(theme);
    })
    // Initial load
    const theme = await client.call('theme', 'currentTheme')
    setLink(theme);
    applyTheme(theme);
  })
  return cssLink
}

