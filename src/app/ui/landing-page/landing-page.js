let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')
var GistHandler = require('../../../lib/gist-handler')
var QueryParams = require('../../../lib/query-params.js')
import * as packageJson from '../../../../package.json'
import { ViewPlugin } from '@remixproject/engine'

let css = csjs`
  .text {
    cursor: pointer;
    font-weight: normal;
    max-width: 300px;
    user-select: none;
  }
  .text:hover {
    text-decoration: underline;
  }
  .homeContainer {
    user-select:none;
  }
  .thisJumboton {
    padding: 2.5rem 0rem;
    margin-bottom: 4rem;
    display: flex;
    align-items: center;
  }
  .hpLogoContainer {
    margin:30px;
    padding-right: 90px;
  }
  .jumboBtnContainer {
  }
  .headlineContainer {
    margin: 0 50px 0 70px;
  }
  .hpSections {
    min-width: 640px;
  }
  .labelIt {
    margin-bottom: 0;
  }
  .seeAll {
    margin-top: 7px;
    white-space: nowrap;
  }
  .importFrom p {
    margin-right: 10px;
  }
  .logoContainer {
    float: left;
  }
  .logoContainer img{
    height: 150px;
    opacity: 0.7;
  }
  .enviroments {
    display: flex;
  }
  .envLogo {
    height: 16px;
  }
  .envLabel {
    cursor: pointer;
  }
  .envButton {
    width: 120px;
    height: 70px;
  }
}
`

const profile = {
  name: 'home',
  displayName: 'Home',
  methods: [],
  events: [],
  description: ' - ',
  icon: 'data:image/png;base64,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',
  location: 'mainPanel',
  version: packageJson.version
}

export class LandingPage extends ViewPlugin {

  constructor (appManager, verticalIcons) {
    super(profile)
    this.profile = profile
    this.appManager = appManager
    this.verticalIcons = verticalIcons
    this.gistHandler = new GistHandler()
  }

  render () {
    let load = (service, item, examples, info) => {
      let compilerImport = new CompilerImport()
      let fileProviders = globalRegistry.get('fileproviders').api
      const msg = yo`
        <div class="p-2">
          <span>Enter the ${item} you would like to load.</span>
          <div>${info}</div>
          <div>e.g ${examples.map((url) => { return yo`<div class="p-1"><a>${url}</a></div>` })}</div>
        </div>`

      modalDialogCustom.prompt(`Import from ${service}`, msg, null, (target) => {
        if (target !== '') {
          compilerImport.import(
            target,
            (loadingMsg) => { tooltip(loadingMsg) },
            (error, content, cleanUrl, type, url) => {
              if (error) {
                modalDialogCustom.alert(error)
              } else {
                fileProviders['browser'].addExternal(type + '/' + cleanUrl, content, url)
                this.verticalIcons.select('fileExplorers')
              }
            }
          )
        }
      })
    }

    const learnMore = () => { window.open('https://remix-ide.readthedocs.io/en/latest/layout.html', '_blank') }

    const startSolidity = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('udapp')
      this.appManager.ensureActivated('solidityStaticAnalysis')
      this.appManager.ensureActivated('solidityUnitTesting')
      this.verticalIcons.select('solidity')
    }
    const startVyper = () => {
      this.appManager.ensureActivated('vyper')
      this.appManager.ensureActivated('udapp')
      this.verticalIcons.select('vyper')
    }
    /*
    const startWorkshop = () => {
      this.appManager.ensureActivated('box')
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('solidityUnitTesting')
      this.appManager.ensureActivated('workshops')
      this.verticalIcons.select('workshops')
    }
    */

    const startPipeline = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('pipeline')
      this.appManager.ensureActivated('udapp')
    }
    const startDebugger = () => {
      this.appManager.ensureActivated('debugger')
      this.verticalIcons.select('debugger')
    }
    const startMythX = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('mythx')
      this.verticalIcons.select('mythx')
    }
    const startSourceVerify = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('source-verification')
      this.verticalIcons.select('source-verification')
    }
    const startPluginManager = () => {
      this.appManager.ensureActivated('pluginManager')
      this.verticalIcons.select('pluginManager')
    }

    const createNewFile = () => {
      let fileExplorer = globalRegistry.get('fileexplorer/browser').api
      fileExplorer.createNewFile()
    }
    const connectToLocalhost = () => {
      this.appManager.ensureActivated('remixd')
    }
    const importFromGist = () => {
      this.gistHandler.loadFromGist({gist: ''}, globalRegistry.get('filemanager').api)
      this.verticalIcons.select('fileExplorers')
    }

    globalRegistry.get('themeModule').api.events.on('themeChanged', () => {
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('remixLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('solidityLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('vyperLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('pipelineLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('debuggerLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('workshopLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('moreLogo'))
    })

    const createEnvButton = (imgPath, envID, envText, callback) => {
      return yo`
        <button class="btn btn-lg border-secondary d-flex mr-3 justify-content-center flex-column align-items-center ${css.envButton}" data-id="landingPageStartSolidity" onclick=${() => callback()}>
          <img class="m-2 align-self-center ${css.envLogo}" id=${envID} src="${imgPath}">
          <label class="text-uppercase text-dark ${css.envLabel}">${envText}</label>
        </button>
      `
    }
    // main
    const solEnv = createEnvButton('/assets/img/solidityLogo.webp', 'solidityLogo', 'Solidity', startSolidity)
    const vyperEnv = createEnvButton('/assets/img/vyperLogo.webp', 'vyperLogo', 'Vyper', startVyper)
    // Featured
    const pipelineEnv = createEnvButton('assets/img/pipelineLogo.webp', 'pipelineLogo', 'Pipeline', startPipeline)
    const debuggerEnv = createEnvButton('assets/img/debuggerLogo.webp', 'debuggerLogo', 'Debugger', startDebugger)
    const mythXEnv = createEnvButton('assets/img/mythxLogo.webp', 'mythxLogo', 'MythX', startMythX)
    const sourceVerifyEnv = createEnvButton('assets/img/sourceVerifyLogo.webp', 'sourceVerifyLogo', 'Source Verify', startSourceVerify)
    const moreEnv = createEnvButton('assets/img/moreLogo.webp', 'moreLogo', 'More', startPluginManager)

    const invertNum = (globalRegistry.get('themeModule').api.currentTheme().quality === 'dark') ? 1 : 0
    solEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    vyperEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    pipelineEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    debuggerEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    mythXEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    sourceVerifyEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    moreEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`

    let switchToPreviousVersion = () => {
      const query = new QueryParams()
      query.update({appVersion: '0.7.7'})
      document.location.reload()
    }
    const img = yo`<img src="assets/img/sleepingRemiCroped.webp"></img>`
    const container = yo`<div class="${css.homeContainer} bg-light" data-id="landingPageHomeContainer">
      <div>
        <div class="alert alert-info clearfix py-3 ${css.thisJumboton}">
          <div class="${css.headlineContainer}">
            <div class="${css.logoContainer}">${img}</div>
          </div>
          <div class="${css.jumboBtnContainer} px-5">
            <button class="btn btn-primary btn-lg mx-3" href="#" onclick=${() => learnMore()} role="button">Learn more</button>
            <button class="btn btn-secondary btn-lg" onclick=${() => switchToPreviousVersion()}>Use previous version</button>
          </div>
        </div><!-- end of jumbotron -->
      </div><!-- end of jumbotron container -->
      <div class="row ${css.hpSections} mx-4" data-id="landingPageHpSections">
        <div id="col1" class="col-sm-5">
          <div class="mb-5">
            <h4>Environments</h4>
            <div class="${css.enviroments} pt-2">
              ${solEnv}
              ${vyperEnv}
            </div>
          </div>
          <div class="file">
            <h4>File</h4>
            <p class="mb-1 ${css.text}" onclick=${() => createNewFile()}>New File</p>
            <p class="mb-1">
              <p class="${css.labelIt} ${css.text}">
                Open Files
                <input title="open file" type="file" onchange="${
                  (event) => {
                    event.stopPropagation()
                    let fileExplorer = globalRegistry.get('fileexplorer/browser').api
                    fileExplorer.uploadFile(event)
                  }
                }" multiple />
              </p>
            </p>
            <p class="mb-1 ${css.text}" onclick=${() => connectToLocalhost()}>Connect to Localhost</p>
            <p class="mt-3 mb-0"><label>IMPORT FROM:</label></p>
            <div class="btn-group">
              <button class="btn mr-1 btn-secondary" data-id="landingPageImportFromGistButton" onclick="${() => importFromGist()}">Gist</button>
              <button class="btn mx-1 btn-secondary" onclick="${() => load('Github', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol', 'github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2'])}">GitHub</button>
              <button class="btn mx-1 btn-secondary" onclick="${() => load('Swarm', 'bzz-raw URL', ['bzz-raw://<swarm-hash>'])}">Swarm</button>
              <button class="btn mx-1 btn-secondary" onclick="${() => load('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>'])}">Ipfs</button>
              <button class="btn mx-1 btn-secondary" onclick="${() => load('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/master/contracts/crowdsale/validation/IndividuallyCappedCrowdsale.sol'])}">https</button>
              <button class="btn mx-1 btn-secondary  text-nowrap" onclick="${() => load('@resolver-engine', 'resolver-engine URL', ['github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2'], yo`<span>please checkout <a class='text-primary' href="https://github.com/Crypto-Punkers/resolver-engine" target='_blank'>https://github.com/Crypto-Punkers/resolver-engine</a> for more information</span>`)}">Resolver-engine</button>
            </div><!-- end of btn-group -->
          </div><!-- end of div.file -->
        </div><!-- end of #col1 -->
        <div id="col2" class="col-sm-7">
          <div class="plugins mb-5">
            <h4>Featured Plugins</h4>
            <div class="d-flex flex-row pt-2">
              ${pipelineEnv}
              ${mythXEnv}
              ${sourceVerifyEnv}
              ${debuggerEnv}
              ${moreEnv}
            </div>
          </div>
          <div class="resources">
            <h4>Resources</h4>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#">Documentation</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://medium.com/remix-ide">Medium Posts</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/">Tutorials</a></p>
          </div>
        </div><!-- end of #col2 -->
      </div><!-- end of hpSections -->
      </div>`

    return container
  }
}
