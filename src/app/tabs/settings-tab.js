/* global Option, Worker */
var $ = require('jquery')
var yo = require('yo-yo')
var QueryParams = require('../../lib/query-params')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()
var helper = require('../../lib/helper')

var css = csjs`
  .settingsTabView {
    padding: 2%;
    display: flex;
  }
  .info {
    ${styles.rightPanel.settingsTab.box_SolidityVersionInfo}
    margin-bottom: 2em;
    word-break: break-word;
  }
  .crow {
    display: flex;
    overflow: auto;
    clear: both;
    padding: .5em;
    font-weight: bold;
  }
  .select {
    ${styles.rightPanel.settingsTab.dropdown_SelectCompiler}
  }
  input {
    margin-right: 3px;
  }
}
`
module.exports = SettingsTab

function SettingsTab (container, appAPI, appEvents, opts) {
  if (typeof container === 'string') container = document.querySelector(container)
  if (!container) throw new Error('no container given')

  var queryParams = new QueryParams()

  var el = yo`
    <div class="${css.settingsTabView} "id="settingsView">
      <div class="${css.info}">
        <div>Your current Solidity version is</div>
        <div id="version"></div>
      </div>
      <div class="${css.crow}">
        <select class="${css.select}" id="versionSelector"></select>
      </div>
      <div class="${css.crow}">
        <div><input class="${css.col1}" id="editorWrap" type="checkbox"></div>
        <span class="${css.checkboxText}">Text Wrap</span>
      </div>
      <div class="${css.crow}">
        <div><input class="${css.col1}" id="optimize" type="checkbox"></div>
        <span class="${css.checkboxText}">Enable Optimization</span>
      </div>
    </div>
  `

  appEvents.compiler.register('compilerLoaded', (version) => {
    setVersionText(version, el)
  })

  var optimize = el.querySelector('#optimize')
  if ((queryParams.get().optimize === 'true')) {
    optimize.setAttribute('checked', true)
    appAPI.setOptimize(true, false)
  } else {
    appAPI.setOptimize(false, false)
  }

  optimize.addEventListener('change', function () {
    var optimize = this.checked
    queryParams.update({ optimize: optimize })
    appAPI.setOptimize(optimize, true)
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

  container.appendChild(el)
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
