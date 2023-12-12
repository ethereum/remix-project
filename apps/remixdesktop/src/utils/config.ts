import fs from 'fs'
import os from 'os'
import path from 'path'

export const cacheDir = path.join(os.homedir(), '.cache_remix_ide')

console.log('cacheDir', cacheDir)

export const createDefaultConfigLocations = async() => {
  try {
    console.log('mdkir', cacheDir, fs.existsSync(cacheDir))
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir)
    }
    if (!fs.existsSync(cacheDir + '/compilers')) {
      fs.mkdirSync(cacheDir + '/compilers')
    }
    if (!fs.existsSync(cacheDir + '/remixdesktop.json')) {
      fs.writeFileSync(cacheDir + '/remixdesktop.json', JSON.stringify({}))
    }
  } catch (e) {
    console.log(e)
  }
}

export const writeConfig = async (data: any) => {
  await createDefaultConfigLocations()
  const cache = readConfig()
  try {
    fs.writeFileSync(cacheDir + '/remixdesktop.json', JSON.stringify({ ...cache, ...data }))
  } catch (e) {
    console.error('Can\'t write config file', e)
  }
}

export const readConfig = async () => {
  await createDefaultConfigLocations()
  if (fs.existsSync(cacheDir + '/remixdesktop.json')) {
    try {
      // read the cache file
      const cache = fs.readFileSync(cacheDir + '/remixdesktop.json')
      const data = JSON.parse(cache.toString())
      return data
    } catch (e) {
      console.error('Can\'t read config file', e)
    }
  }
  return undefined
}