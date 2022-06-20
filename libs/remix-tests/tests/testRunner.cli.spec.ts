import { spawnSync, execSync } from 'child_process'
import { resolve } from 'path'

describe('testRunner: remix-tests CLI', () => {
    // remix-tests binary, after build, is used as executable 
    
    const executablePath = resolve(__dirname + '/../../../dist/libs/remix-tests/bin/remix-tests')
    
    const result = spawnSync('ls', { cwd: resolve(__dirname + '/../../../dist/libs/remix-tests') })
    if(result) {
        const dirContent = result.stdout.toString()
        // Install dependencies if 'node_modules' is not already present
        if(!dirContent.includes('node_modules')) {
          execSync('yarn install', { cwd: resolve(__dirname + '/../../../dist/libs/remix-tests') })
        }
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
  -e, --evm <string>       set EVM version (e.g: petersburg, istanbul etc)
  -o, --optimize <bool>    enable/disable optimization
  -r, --runs <number>      set runs (e.g: 150, 250 etc)
  -v, --verbose <level>    set verbosity level (0 to 5)
  -h, --help               output usage information

Commands:
  version                  output the version number
  help                     output usage information`
        expect(res.stdout.toString().trim()).toBe(expectedHelp)
      })

    test('remix-tests running a test file', () => {
      const res = spawnSync(executablePath, [resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/AssertOkTest/)
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
      expect(res.stdout.toString().trim()).toMatch(/expected value to be ok to: true/)
      expect(res.stdout.toString().trim()).toMatch(/returned: false/)
    })

    test('remix-tests running a test file with custom compiler version', () => {
      const res = spawnSync(executablePath, ['--compiler', '0.7.4', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('Compiler version set to 0.7.4. Latest version is')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('Loading remote solc version v0.7.4+commit.3f05b770 ...')).toBeTruthy()
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
    })

    test('remix-tests running a test file with unavailable custom compiler version (should fail)', () => {
      const res = spawnSync(executablePath, ['--compiler', '1.10.4', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('No compiler found in releases with version 1.10.4')).toBeTruthy()
    })

    test('remix-tests running a test file with custom EVM', () => {
      const res = spawnSync(executablePath, ['--evm', 'petersburg', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('EVM set to petersburg')).toBeTruthy()
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
    })

    test('remix-tests running a test file by enabling optimization', () => {
      const res = spawnSync(executablePath, ['--optimize', 'true', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('Optimization is enabled')).toBeTruthy()
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
    })

    test('remix-tests running a test file by enabling optimization and setting runs', () => {
      const res = spawnSync(executablePath, ['--optimize', 'true', '--runs', '300', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('Optimization is enabled')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('Runs set to 300')).toBeTruthy()
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
    })

    test('remix-tests running a test file without enabling optimization and setting runs (should fail)', () => {
      const res = spawnSync(executablePath, ['--runs', '300', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('Optimization should be enabled for runs')).toBeTruthy()
    })

    test('remix-tests running a test file with all options', () => {
      const res = spawnSync(executablePath, ['--compiler', '0.7.5', '--evm', 'istanbul', '--optimize', 'true', '--runs', '250', resolve(__dirname + '/examples_0/assert_ok_without_console_test.sol')])
      // match initial lines
      expect(res.stdout.toString().trim().includes('Compiler version set to 0.7.5. Latest version is')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('Loading remote solc version v0.7.5+commit.eb77ed08 ...')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('EVM set to istanbul')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('Optimization is enabled')).toBeTruthy()
      expect(res.stdout.toString().trim().includes('Runs set to 250')).toBeTruthy()
      expect(res.stdout.toString().trim()).toMatch(/:: Running remix-tests - Unit testing for solidity ::/)
      expect(res.stdout.toString().trim()).toMatch(/creation of library remix_tests.sol:Assert pending.../)
      // match test result
      expect(res.stdout.toString().trim()).toMatch(/Ok pass test/)
      expect(res.stdout.toString().trim()).toMatch(/Ok fail test/)
      // match fail test details
      expect(res.stdout.toString().trim()).toMatch(/error: okFailTest fails/)
    })
  })
})