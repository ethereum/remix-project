/* global alert, confirm, prompt */
var yo = require('yo-yo')
var $ = require('jquery')
var QueryParams = require('./query-params')
var queryParams = new QueryParams()

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .filesTabView {
    padding: 2%;
  }
  .crow {
    margin-top: 1em;
    display: flex;
  }
  .infoBox extends ${styles.infoTextBox} {
    margin-top: 2em;
  }
`

module.exports = filesTab

function filesTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.filesTabView}" id="publishView">
      <div class="${css.crow}">
        <button id="gist" title="Publish all files as public gist on github.com">
          <i class="fa fa-github"></i>
          Publish Gist
        </button>
        Publish all open files to an anonymous github gist.<br>
      </div>
      <div class="${css.crow}">
        <button id="copyOver" title="Copy all files to another instance of browser-solidity.">
          Copy files
        </button>
        Copy all files to another instance of Browser-solidity.
      </div>
      <div class="${css.infoBox}">You can also load a gist by adding the following
        <span class="pre">#gist=GIST_ID</span>
        to your url, where GIST_ID is the id of the gist to load.
      </div>
    </div>
  `
  // ------------------ gist publish --------------

  el.querySelector('#gist').addEventListener('click', function () {
    if (confirm('Are you sure you want to publish all your files anonymously as a public gist on github.com?')) {
      appAPI.packageFiles((error, packaged) => {
        if (error) {
          console.log(error)
        } else {
          var description = 'Created using browser-solidity: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/browser-solidity/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='
          console.log(packaged)
          $.ajax({
            url: 'https://api.github.com/gists',
            type: 'POST',
            data: JSON.stringify({
              description: description,
              public: true,
              files: packaged
            })
          }).done(function (response) {
            if (response.html_url && confirm('Created a gist at ' + response.html_url + ' Would you like to open it in a new window?')) {
              window.open(response.html_url, '_blank')
            }
          }).fail(function (xhr, text, err) {
            console.log('fail', text)
            alert('Failed to create gist: ' + (err || 'Unknown transport error'))
          })
        }
      })
    }
  })
  el.querySelector('#copyOver').addEventListener('click', function () {
    var target = prompt(
      'To which other browser-solidity instance do you want to copy over all files?',
      'https://ethereum.github.io/browser-solidity/'
    )
    if (target === null) {
      return
    }
    appAPI.packageFiles((error, packaged) => {
      if (error) {
        console.log(error)
      } else {
        $('<iframe/>', {
          src: target,
          style: 'display:none;',
          load: function () { this.contentWindow.postMessage(['loadFiles', packaged], '*') }
        }).appendTo('body')
      }
    })
  })
  container.appendChild(el)
}
