import * as packageJson from '../../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine'

let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')
var GistHandler = require('../../../lib/gist-handler')
var QueryParams = require('../../../lib/query-params.js')

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
    user-select: none;
    overflow-y: hidden;
  }
  .mainContent {
    flex-grow: 3;
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
  .hpSections {
    min-width: 640px;
  }
  .remixHomeMedia {
    overflow-x: hidden;
    overflow-y: auto;
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
  .cursorStyle {
    cursor: pointer;
  }
  .envButton {
    width: 120px;
    height: 70px;
  }
  .block input[type='radio']:checked ~ .media{
    width: auto;
    display: block;
    transition: .5s ease-in;
  }
  .media{
    width: 0;
    display: none;
    overflow: hidden;
    transition: .5s ease-out;
  }
  .mediumPanel {
    width: 400px;
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
    const themeQuality = globalRegistry.get('themeModule').api.currentTheme().quality
    this.twitterFrame = yo`
      <div class="px-2 ${css.media}">
        <a class="twitter-timeline"
          data-width="400"
          data-theme="${themeQuality}"
          data-chrome="nofooter noheader transparent"
          data-tweet-limit="8"
          href="https://twitter.com/EthereumRemix"
        >
        </a>
        <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `
    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
      console.log("theme is ", theme.quality)
      this.onThemeChanged(theme.quality)
    })
  }

  onThemeChanged (themeQuality) {
    console.log("themes in listener is", themeQuality)
    let twitterFrame = yo`
      <div class="px-2 ${css.media}">
        <a class="twitter-timeline"
          data-width="400"
          data-theme="${themeQuality}"
          data-chrome="nofooter noheader transparent"
          data-tweet-limit="8"
          href="https://twitter.com/EthereumRemix"
        >
        </a>
        <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `
    yo.update(this.twitterFrame, twitterFrame)
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

    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
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
          <label class="text-uppercase text-dark ${css.cursorStyle}">${envText}</label>
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

    const themeQuality = globalRegistry.get('themeModule').api.currentTheme().quality
    const invertNum = (themeQuality === 'dark') ? 1 : 0
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

    // to retrieve medium posts
    document.body.appendChild(yo`<script src="https://www.retainable.io/assets/retainable/rss-embed/retainable-rss-embed.js"></script>`)
    const container = yo`
      <div class="${css.homeContainer} d-flex" data-id="landingPageHomeContainer">
        <div class="${css.mainContent} bg-light">
          <div>
            <span class="${css.text} text-secondary" onclick=${() => switchToPreviousVersion()}>Previous version</span>
            <div class="border-bottom clearfix py-3 ${css.thisJumboton}">
              <div class="mx-4 ${css.logoContainer}">${img}</div>
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
                <p class="mb-1">
                  <i class="mr-1 far fa-file"></i>
                  <span class="mb-1 ${css.text}" onclick=${() => createNewFile()}>New File</span>
                </p>
                <p class="mb-1">
                  <i class="mr-1 far fa-file-alt"></i>
                  <span class="${css.labelIt} ${css.text}">
                    Open Files
                    <input title="open file" type="file" onchange="${
                      (event) => {
                        event.stopPropagation()
                        let fileExplorer = globalRegistry.get('fileexplorer/browser').api
                        fileExplorer.uploadFile(event)
                      }
                    }" multiple />
                  </span>
                </p>
                <p class="mb-1">
                  <i class="far fa-hdd"></i>
                  <span class="${css.text}" onclick=${() => connectToLocalhost()}>Connect to Localhost</span>
                </p>
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
                <p class="mb-1">
                  <i class="mr-1 fas fa-book"></i>
                  <a class="${css.text}" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#">Documentation</a>
                </p>
                <p class="mb-1">
                  <i class="mr-1 fab fa-gitter"></i>
                  <a class="${css.text}" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a>
                  </p>
                <p class="mb-1">
                  <i class="mr-1 fab fa-medium"></i>
                  <a class="${css.text}" target="__blank" href="https://medium.com/remix-ide">Medium Posts</a>
                </p>
              </div>
            </div><!-- end of #col2 -->
          </div><!-- end of hpSections -->
        </div>
        <div class="d-flex">
          <div id="remixIDE_TwitterBlock" class="border-left p-2 mx-0 mb-0 ${css.block} ${css.remixHomeMedia}">
            <input type="radio" name="media" id="remixIDE_TwitterRadio" class="d-none" checked />
            <label class="mx-1 my-0 btn p-0 text-info fab fa-twitter ${css.cursorStyle}" for="remixIDE_TwitterRadio"></label>
            ${this.twitterFrame}
          </div>
          <div id="remixIDE_MediumBlock" class="border-left p-2 mx-0 mb-0 ${css.block} ${css.remixHomeMedia}">
            <input type="radio" name="media" id="remixIDE_MediumRadio" class="d-none" />
            <label class="mx-1 my-0 btn p-0 text-danger fab fa-medium ${css.cursorStyle}" for="remixIDE_MediumRadio"></label>
            <div class="px-2 ${css.media}">
              <div id="medium-widget" class="${css.mediumPanel}">
                <div
                  id="retainable-rss-embed"
                  data-rss="https://medium.com/feed/remix-ide"
                  data-maxcols="1"
                  data-layout="grid"
                  data-poststyle="external"
                  data-readmore="More..."
                  data-buttonclass="btn mb-3"
                  data-offset="-100">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    return container
  }
}
