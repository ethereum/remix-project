import { PluginOptions } from "./client"

// Old link: 'https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json'
export const remixOrgins = 'https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json'

/** Fetch the default origins for remix */
export async function getOriginsFromUrl(url: string) {
  const res = await fetch(url)
  return res.json()
}


export function getDevmodeOrigins({ devMode }: Partial<PluginOptions<any>>) {
  const localhost = devMode.port ? [
    `http://127.0.0.1:${devMode.port}`,
    `http://localhost:${devMode.port}`,
    `https://127.0.0.1:${devMode.port}`,
    `https://localhost:${devMode.port}`,
  ] : []
  const devOrigins = devMode.origins
    ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
    : []
  return [ ...localhost, ...devOrigins ]
}


/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param options client plugin options
 */
export async function checkOrigin(origin: string, options: Partial<PluginOptions<any>> = {}) {
  let origins = []
  if (options.allowOrigins) {
    if (Array.isArray(options.allowOrigins)) {
      origins = origins.concat(options.allowOrigins)
    } else {
      const allOrigins = await getOriginsFromUrl(options.allowOrigins)
      origins = origins.concat(allOrigins)
    }
  } else if (options.devMode) {
    const devModes = getDevmodeOrigins(options)
    origins = origins.concat(devModes)
  } else {
    return true
  }
  return origins.includes(origin)
}
