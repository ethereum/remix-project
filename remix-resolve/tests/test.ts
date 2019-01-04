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
  describe('#resolve', () => {
    describe('test example_1 [local imports]]', () => {
      // AppManager tests
      describe('test with AppManager', () => {
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
            .then(sources => {
              results = sources
              done()
            })
            .catch(e => {
              throw e
            })
        })
        it('Plugin should be added to app', () => {
          assert.equal(typeof(app.calls[api.type].resolve), 'function')
        })

        it('should returns contract content of given local path', () => {
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
        it('should returns contract content of given local path', () => {
          const expt = {
            content: 'pragma solidity ^0.5.0;\nimport "./mortal.sol";\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n',
            cleanURL: 'ipfs://QmeKtwMBqz5Ac7oL8SyTD96mccEzw9X9d39jLb2kgnBYbn',
            type: 'ipfs'
          }
          assert.deepEqual(results, expt)
        })
      })
    })
  })
})
