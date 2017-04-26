var yo = require('yo-yo')

module.exports = filesTab

function filesTab () {
  return yo`
    <div id="publishView">
      <p>
        <button id="gist" title="Publish all files as public gist on github.com">
          <i class="fa fa-github"></i>
          Publish Gist
        </button>
        Publish all open files to an anonymous github gist.<br>
        <button id="copyOver" title="Copy all files to another instance of browser-solidity.">
          Copy files
        </button>
        Copy all files to another instance of Browser-solidity.
      </p>
      <p>You can also load a gist by adding the following
        <span class="pre">#gist=GIST_ID</span>
        to your url, where GIST_ID is the id of the gist to load.
      </p>
    </div>
  `
}
