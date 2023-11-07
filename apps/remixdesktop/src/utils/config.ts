import fs from 'fs'
import os from 'os'
import path from 'path'

export const cacheDir = path.join(os.homedir(), '.cache_remix_ide')

console.log('cacheDir', cacheDir)

try {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir)
    }
    if(!fs.existsSync(cacheDir + '/remixdesktop.json')) {
        fs.writeFileSync(cacheDir + '/remixdesktop.json', JSON.stringify({}))
    }
} catch (e) {
}
export const writeConfig = (data: any) => {
    const cache = readConfig()
    try {
        fs.writeFileSync(cacheDir + '/remixdesktop.json', JSON.stringify({ ...cache, ...data }))
    } catch (e) {
        console.error('Can\'t write config file', e)
    }
}

export const readConfig = () => {
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