import fs from 'fs'
import os from 'os'
import path from 'path'

export const cacheDir = path.join(os.homedir(), '.cache_remix_ide')

console.log('cache dir is:', cacheDir)

export const createDefaultConfigLocations = async() => {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir)
    }
    if (!fs.existsSync(cacheDir + '/compilers')) {
      fs.mkdirSync(cacheDir + '/compilers')
    }
    if (!fs.existsSync(cacheDir + '/remixdesktop.json')) {
      console.log('create config file')
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
    //console.log('write config file', data)
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
      //console.log('read config file', data)
      return data
    } catch (e) {
      console.error('Can\'t read config file', e)
    }
  }
  return undefined
}