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

      test('remix-tests help', () => {
        const res = spawnSync(executablePath, ['-h'])
        const expectedHelp = `Usage: remix-tests [options] [command]

Options:
  -V, --version            output the version number
  -c, --compiler <string>  set compiler version (e.g: 0.6.1, 0.7.1 etc)
  -e, --evm <string>       set EVM version
  -o, --optimize <bool>    enable/disable optimization
  -r, --runs <number>      set runs
  -v, --verbose <level>    set verbosity level
  -h, --help               output usage information

Commands:
  version                  output the version number
  help                     output usage information`
        expect(res.stdout.toString().trim()).toBe(expectedHelp)
      })

    test('remix-tests running a test file', () => {
      const res = spawnSync(executablePath, [resolve(__dirname + '/examples_0/assert_ok_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/AssertOkTest/)
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // macth fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
      expect(res.stdout.toString().trim()).toMatch(/expected value to be ok to: true/)
      expect(res.stdout.toString().trim()).toMatch(/returned: false/)
    })
  })
})