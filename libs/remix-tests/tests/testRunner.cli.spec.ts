import { spawnSync, execSync } from 'child_process'
import { resolve } from 'path'

describe('testRunner: remix-tests CLI', () => {
    // remix-tests binary, after build, is used as executable 
    const executablePath = resolve(__dirname + '/../../../dist/libs/remix-tests/bin/remix-tests')
    const result = spawnSync('ls', { cwd: resolve(__dirname + '/../../../dist/libs/remix-tests') })
    if(result) {
        const dirContent = result.stdout.toString()
        // Install dependencies if 'node_modules' is not already present
        if(!dirContent.includes('node_modules')) execSync('npm install', { cwd: resolve(__dirname + '/../../../dist/libs/remix-tests') })
    }

    describe('test various CLI options', () => {
      test('remix-tests version', () => {
        const res = spawnSync(executablePath, ['-V'])
        expect(res.stdout.toString().trim()).toBe(require('../package.json').version)
      })
    })
})