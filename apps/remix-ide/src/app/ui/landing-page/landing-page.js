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
  icon: 'assets/img/remixLogo.webp',
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
        <button class="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center ${css.envButton}" data-id="landingPageStartSolidity" onclick=${() => callback()}>
          <img class="m-2 align-self-center ${css.envLogo}" id=${envID} src="${imgPath}">
          <label class="text-uppercase text-dark ${css.envLabel}">${envText}</label>
        </button>
      `
    }
    // main
    const solEnv = createEnvButton('assets/img/solidityLogo.webp', 'solidityLogo', 'Solidity', startSolidity)
    const vyperEnv = createEnvButton('assets/img/vyperLogo.webp', 'vyperLogo', 'Vyper', startVyper)
    // Featured
    const pipelineEnv = createEnvButton('assets/img/pipelineLogo.webp', 'pipelineLogo', 'Pipeline', startPipeline)
    const debuggerEnv = createEnvButton('assets/img/debuggerLogo.webp', 'debuggerLogo', 'Debugger', startDebugger)
    const mythXEnv = createEnvButton('assets/img/mythxLogo.webp', 'mythxLogo', 'MythX', startMythX)
    const sourceVerifyEnv = createEnvButton('assets/img/sourceVerifyLogo.webp', 'sourceVerifyLogo', 'Sourcify', startSourceVerify)
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
            <button class="btn btn-primary mx-3" href="#" onclick=${() => learnMore()} role="button">Learn more</button>
            <button class="btn btn-secondary" onclick=${() => switchToPreviousVersion()}>Use previous version</button>
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
