/* global Option, Worker */
var $ = require('jquery')
var yo = require('yo-yo')
var QueryParams = require('../../lib/query-params')
var remixLib = require('remix-lib')
var Storage = remixLib.Storage
var styleGuide = remixLib.ui.themeChooser
var helper = require('../../lib/helper')
var modal = require('../ui/modal-dialog-custom')

var css = require('./styles/settings-tab-styles')

function SettingsTab (appAPI = {}, appEvents = {}, opts = {}) {
  var queryParams = new QueryParams()

  var optionVM = yo`<input id="alwaysUseVM" type="checkbox">`
  var personal = yo`<input id="personal" type="checkbox">`
  var warnText = `Transaction sent over Web3 will use the web3.personal API - be sure the endpoint is opened before enabling it.
  This mode allows to provide the passphrase in the Remix interface without having to unlock the account.
  Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...).
  It is not recommended (and also most likely not relevant) to use this mode with an injected provider (Mist, Metamask, ...) or with JavaScript VM.
  Remix never persist any passphrase.`
  var warnPersonalMode = yo`<i title=${warnText} class="${css.icon} fa fa-exclamation-triangle" aria-hidden="true"></i>`

  var el = yo`
    <div class="${css.settingsTabView} "id="settingsView">
      <div class="${css.info}">
        <div class=${css.title}>Solidity version</div>
        <span>Current version:</span> <span id="version"></span>
        <div class="${css.crow}">
          <select class="${css.select}" id="versionSelector"></select>
        </div>
      </div>
      <div class="${css.info}">
      <div class=${css.title}>General settings</div>
        <div class="${css.crow}">
          <div>${optionVM}</div>
          <span class="${css.checkboxText}">Always use Ethereum VM at Load</span>
        </div>
        <div class="${css.crow}">
          <div><input id="editorWrap" type="checkbox"></div>
          <span class="${css.checkboxText}">Text Wrap</span>
        </div>
        <div class="${css.crow}">
          <div><input id="optimize" type="checkbox"></div>
          <span class="${css.checkboxText}">Enable Optimization</span>
        </div>
        <div class="${css.crow}">
          <div>${personal}></div>
          <span class="${css.checkboxText}">Enable Personal Mode ${warnPersonalMode}></span>
        </div>
      </div>
      <div class="${css.info}">
        <div class=${css.title}>Remixd</div>
        <div class="${css.crow}">
          Remixd is a tool which allow Remix IDE to access files located in your local computer.
          it can also be used to setup a development environment.
        </div>
        <div class="${css.crow}">More infos:</div>
        <div class="${css.crow}"><a target="_blank" href="https://github.com/ethereum/remixd"> https://github.com/ethereum/remixd</a></div>
        <div class="${css.crow}"><a target="_blank" href="http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html">http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html</a></div>
        <div class="${css.crow}">Installation: <pre class=${css.remixdinstallation}>npm install remixd -g</pre></div>
      </div>
      <div class="${css.info}">
        <div class=${css.title}>Themes</div>
        <div class=${css.attention}>
          <i title="Select the theme" class="${css.icon} fa fa-exclamation-triangle" aria-hidden="true"></i>
          <span>Selecting a theme will trigger a page reload</span>
        </div>
        <div class="${css.crow}">
          <input class="${css.col1}" name="theme" id="themeLight" type="checkbox">
          <label for="themeLight">Light Theme</label>
        </div>
        <div class="${css.crow}">
          <input class="${css.col1}" name="theme" id="themeDark" type="checkbox">
          <label for="themeDark">Dark Theme</label>
        </div>
      </div>
      <div class="${css.info}">
        <div class=${css.title}>Plugin</div>
        <div class="${css.crowNoFlex}">
          <div class=${css.attention}>
            <i title="Do not use this feature yet" class="${css.icon} fa fa-exclamation-triangle" aria-hidden="true"></i>
            <span> Do not use this alpha feature if you are not sure what you are doing!</span>
          </div>
          <div>
            <textarea rows="4" cols="70" id="plugininput" type="text" class="${css.pluginTextArea}" ></textarea>
            <input onclick=${loadPlugin} type="button" value="Load" class="${css.pluginLoad}">
            </div>
        </div>
      </div>
    </div>

  `

  function loadPlugin () {
    var json = el.querySelector('#plugininput').value
    try {
      json = JSON.parse(json)
    } catch (e) {
      modal.alert('cannot parse the plugin definition to JSON')
      return
    }
    appEvents.rhp.trigger('plugin-loadRequest', [json])
  }

  appEvents.compiler.register('compilerLoaded', (version) => {
    setVersionText(version, el)
  })

  optionVM.checked = appAPI.config.get('settings/always-use-vm') || false
  optionVM.addEventListener('change', event => {
    appAPI.config.set('settings/always-use-vm', !appAPI.config.get('settings/always-use-vm'))
  })

  personal.checked = appAPI.config.get('settings/personal-mode') || false
  personal.addEventListener('change', event => {
    appAPI.config.set('settings/personal-mode', !appAPI.config.get('settings/personal-mode'))
  })

  var optimize = el.querySelector('#optimize')
  if ((queryParams.get().optimize === 'true')) {
    optimize.setAttribute('checked', true)
    appAPI.setOptimize(true, false)
  } else {
    queryParams.update({ optimize: false })
    appAPI.setOptimize(false, false)
  }

  optimize.addEventListener('change', function () {
    var optimize = this.checked
    queryParams.update({ optimize: optimize })
    appAPI.setOptimize(optimize, true)
  })

  var themeStorage = new Storage('style:')
  var currTheme = themeStorage.get('theme')
  var themeDark = el.querySelector('#themeDark')
  var themeLight = el.querySelector('#themeLight')

  if (currTheme === 'dark') {
    themeDark.setAttribute('checked', 'checked')
  } else {
    themeLight.setAttribute('checked', 'checked')
  }

  themeDark.addEventListener('change', function () {
    console.log('change dark theme')
    styleGuide.switchTheme('dark')
    window.location.reload()
  })

  themeLight.addEventListener('change', function () {
    console.log('change to light theme')
    styleGuide.switchTheme('light')
    window.location.reload()
  })

  // ----------------- version selector-------------

  // clear and disable the version selector
  var versionSelector = el.querySelector('#versionSelector')
  versionSelector.innerHTML = ''
  versionSelector.setAttribute('disabled', true)

  // load the new version upon change
  versionSelector.addEventListener('change', function () {
    loadVersion(versionSelector.value, queryParams, appAPI, el)
  })

  var header = new Option('Select new compiler version')
  header.disabled = true
  header.selected = true
  versionSelector.appendChild(header)

  $.getJSON('https://ethereum.github.io/solc-bin/bin/list.json').done(function (data) {
    // populate version dropdown with all available compiler versions (descending order)
    $.each(data.builds.slice().reverse(), function (i, build) {
      versionSelector.appendChild(new Option(build.longVersion, build.path))
    })

    versionSelector.removeAttribute('disabled')

    // always include the local version
    versionSelector.appendChild(new Option('latest local version', 'builtin'))

    // find latest release
    var selectedVersion = data.releases[data.latestRelease]

    // override with the requested version
    if (queryParams.get().version) {
      selectedVersion = queryParams.get().version
    }

    loadVersion(selectedVersion, queryParams, appAPI, el)
  }).fail(function (xhr, text, err) {
    // loading failed for some reason, fall back to local compiler
    versionSelector.append(new Option('latest local version', 'builtin'))

    loadVersion('builtin', queryParams, appAPI, el)
  })

  return { render () { return el } }
}

function setVersionText (text, el) {
  el.querySelector('#version').innerText = text
}

function loadVersion (version, queryParams, appAPI, el) {
  queryParams.update({ version: version })
  var url
  if (version === 'builtin') {
    var location = window.document.location
    location = location.protocol + '//' + location.host + '/' + location.pathname
    if (location.endsWith('index.html')) {
      location = location.substring(0, location.length - 10)
    }
    if (!location.endsWith('/')) {
      location += '/'
    }

    url = location + 'soljson.js'
  } else {
    if (version.indexOf('soljson') !== 0 || helper.checkSpecialChars(version)) {
      console.log('loading ' + version + ' not allowed')
      return
    }
    url = 'https://ethereum.github.io/solc-bin/bin/' + version
  }
  var isFirefox = typeof InstallTrigger !== 'undefined'
  if (document.location.protocol !== 'file:' && Worker !== undefined && isFirefox) {
    // Workers cannot load js on "file:"-URLs and we get a
    // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
    // resort to non-worker version in that case.
    appAPI.loadCompiler(true, url)
    setVersionText('(loading using worker)', el)
  } else {
    appAPI.loadCompiler(false, url)
    setVersionText('(loading)', el)
  }
}

module.exports = SettingsTab
