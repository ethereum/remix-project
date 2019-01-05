import { RemixResolve, RemixResolveApi } from '../src'
import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import { AppManager, PluginProfile } from 'remix-plugin'

const RemixResolveProfile: PluginProfile<RemixResolve> = {
  type: 'remix-resolve',
  methods: ['resolve'],
  url: ''
}
interface IAppManager {
  modules: {
    remixResolve: RemixResolve
  },
  plugins: {}
}

describe('testRunner', () => {
  describe('# RemixResolveApi.resolve()', () => {
    // AppManager tests
    describe('* test with AppManager', () => {
      describe('test example_1 [local imports]', () => {
        let app: AppManager<IAppManager>
        let api: RemixResolveApi

        const fileName = '../remix-resolve/tests/example_1/greeter.sol'
        let results: object = {}

        before(done => {
          api = new RemixResolveApi()
          app = new AppManager({
            modules: [{ json: RemixResolveProfile, api }]
          })

          function handleLocal(pathString: string, filePath: string) {
            // if no relative/absolute path given then search in node_modules folder
            if (pathString && pathString.indexOf('.') !== 0 && pathString.indexOf('/') !== 0) {
              // return handleNodeModulesImport(pathString, filePath, pathString)
              return
            } else {
              const o = { encoding: 'UTF-8' }
              const p = pathString ? path.resolve(pathString, filePath) : path.resolve(pathString, filePath)
              const content = fs.readFileSync(p, o)
              return content
            }
          }
          const localFSHandler = [
            {
              type: 'local',
              match: (url: string) => { return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(url) },
              handle: (match: Array<string>) => { return handleLocal(match[2], match[3]) }
            }
          ]
          app['modules'][api.type].api.resolve(fileName, localFSHandler)
            .then((sources: object) => {
              results = sources
              done()
            })
            .catch((e: Error) => {
              throw e
            })
        })
        it('Plugin should be added to app', () => {
          assert.equal(typeof(app.calls[api.type].resolve), 'function')
        })

        it('should return contract content of given local path', () => {
          const expt = {
            content: 'pragma solidity ^0.5.0;\nimport "./mortal.sol";\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n',
            cleanURL: '../remix-resolve/tests/example_1/greeter.sol',
            type: 'local'
          }
          assert.deepEqual(results, expt)
        })
      })
      // test IPFShandle
      describe('test getting IPFS files', function() {
        let app: AppManager<IAppManager>
        let api: RemixResolveApi

        const fileName: string = 'ipfs://QmeKtwMBqz5Ac7oL8SyTD96mccEzw9X9d39jLb2kgnBYbn'
        let results: object

        before((done) => {
          try {
            api = new RemixResolveApi()
            app = new AppManager({
              modules: [{ json: RemixResolveProfile, api }]
            })

            app['modules'][api.type].api.resolve(fileName)
            .then((sources: object) => {
              results = sources
              done()
            })
            .catch((e: Error) => {
              throw e
            })
          } catch(e) {
            throw e
          }
        })

        it('should have 3 items', () => {
          assert.equal(Object.keys(results).length, 3)
        })
        it('should return contract content of given IPFS path', () => {
          const expt = {
            content: 'pragma solidity ^0.5.0;\nimport "./mortal.sol";\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n',
            cleanURL: 'ipfs://QmeKtwMBqz5Ac7oL8SyTD96mccEzw9X9d39jLb2kgnBYbn',
            type: 'ipfs'
          }
          assert.deepEqual(results, expt)
        })
      })
    })
    describe('* test without AppManager', () => {
      describe('test example_1 [local imports]', () => {
        const remixResolve = new RemixResolveApi()
        const fileName: string = '../remix-resolve/tests/example_1/greeter.sol'
        let results: object = {}

        before(done => {
          function handleLocal(pathString: string, filePath: string) {
            // if no relative/absolute path given then search in node_modules folder
            if (pathString && pathString.indexOf('.') !== 0 && pathString.indexOf('/') !== 0) {
              // return handleNodeModulesImport(pathString, filePath, pathString)
              return
            } else {
              const o = { encoding: 'UTF-8' }
              const p = pathString ? path.resolve(pathString, filePath) : path.resolve(pathString, filePath)
              const content = fs.readFileSync(p, o)
              return content
            }
          }
          const localFSHandler = [
            {
              type: 'local',
              match: (url: string) => { return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(url) },
              handle: (match: Array<string>) => { return handleLocal(match[2], match[3]) }
            }
          ]
          remixResolve.resolve(fileName, localFSHandler)
            .then((sources: object) => {
              results = sources
              done()
            })
            .catch((e: Error) => {
              throw e
            })
        })

        it('should return contract content of given local path', () => {
          const expt = {
            content: 'pragma solidity ^0.5.0;\nimport "./mortal.sol";\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n',
            cleanURL: '../remix-resolve/tests/example_1/greeter.sol',
            type: 'local'
          }
          assert.deepEqual(results, expt)
        })
      })
      // Test github import
      describe('test getting github imports', () => {
        const remixResolve = new RemixResolveApi()
        const fileName: string = 'https://github.com/ethereum/populus/docs/assets/Greeter.sol'
        let results: object = {}

        before(done => {
          remixResolve.resolve(fileName)
            .then((sources: object) => {
              results = sources
              done()
            })
            .catch((e: Error) => {
              throw e
            })
        })
        it('should have 3 items', () => {
          assert.equal(Object.keys(results).length, 3)
        })
        it('should return contract content of given local path', () => {
          const expt = {
            cleanURL: 'https://github.com/ethereum/populus/docs/assets/Greeter.sol',
            content: {
              name: 'Greeter.sol',
              path: 'docs/assets/Greeter.sol',
              sha: '21f9aae3fb766dc5dc8aeb5a5518c7a69aca74e8',
              size: 378,
              url:
              'https://api.github.com/repos/ethereum/populus/contents/docs/assets/Greeter.sol?ref=master',
              html_url:
              'https://github.com/ethereum/populus/blob/master/docs/assets/Greeter.sol',
              git_url:
              'https://api.github.com/repos/ethereum/populus/git/blobs/21f9aae3fb766dc5dc8aeb5a5518c7a69aca74e8',
              download_url:
              'https://raw.githubusercontent.com/ethereum/populus/master/docs/assets/Greeter.sol',
              type: 'file',
              content:
              'cHJhZ21hIHNvbGlkaXR5IF4wLjQuMDsKCmNvbnRyYWN0IEdyZWV0ZXIgewog\nICAgc3RyaW5nIHB1YmxpYyBncmVldGluZzsKCiAgICAvLyBUT0RPOiBQb3B1\nbHVzIHNlZW1zIHRvIGdldCBubyBieXRlY29kZSBpZiBgaW50ZXJuYWxgCiAg\nICBmdW5jdGlvbiBHcmVldGVyKCkgcHVibGljIHsKICAgICAgICBncmVldGlu\nZyA9ICdIZWxsbyc7CiAgICB9CgogICAgZnVuY3Rpb24gc2V0R3JlZXRpbmco\nc3RyaW5nIF9ncmVldGluZykgcHVibGljIHsKICAgICAgICBncmVldGluZyA9\nIF9ncmVldGluZzsKICAgIH0KCiAgICBmdW5jdGlvbiBncmVldCgpIHB1Ymxp\nYyBjb25zdGFudCByZXR1cm5zIChzdHJpbmcpIHsKICAgICAgICByZXR1cm4g\nZ3JlZXRpbmc7CiAgICB9Cn0K\n',
              encoding: 'base64',
              _links: {
                self: 'https://api.github.com/repos/ethereum/populus/contents/docs/assets/Greeter.sol?ref=master',
                git: 'https://api.github.com/repos/ethereum/populus/git/blobs/21f9aae3fb766dc5dc8aeb5a5518c7a69aca74e8',
                html: 'https://github.com/ethereum/populus/blob/master/docs/assets/Greeter.sol'
              }
            },
            type: 'github'
          }
          assert.deepEqual(results, expt)
        })
      })
    })
  })
})
