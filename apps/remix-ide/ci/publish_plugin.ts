import fetch from "node-fetch";
(async () => {
  const pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
  const metadata = await fetch(pluginsDirectory, { method: 'GET' })

  // get command line arguments
  const args = process.argv
  const pluginName = args[0]
  const sha = args[1]
  const build = args[2]

  if (!pluginName || !sha || !build) {
    console.error('missing arguments')
    process.exit(1)
  }

  // search for the plugin in the metadata
  const plugins = await metadata.json()
  const plugin = plugins.find((p: any) => p.name === pluginName)
  if (!plugin) {
    console.error('plugin not found')
    process.exit(1)
  }

  // update the plugin
  plugin.build = build
  plugin.sha = sha

  console.log('publishing plugin', plugin, 'with sha', sha, 'and build', build)
})()