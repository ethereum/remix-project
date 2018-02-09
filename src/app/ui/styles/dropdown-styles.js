var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .dropdown           {
    ${styles.terminal.dropdown_Filter_MenuBar}
    overflow          : visible;
    position          : relative;
    display           : flex;
    flex-direction    : column;
    margin-right      : 10px;
  }
  .selectbox          {
    display           : flex;
    align-items       : center;
    margin            : 3px;
    cursor            : pointer;
  }
  .selected           {
    display           : inline-block;
    min-width         : 30ch;
    max-width         : 30ch;
    white-space       : nowrap;
    text-overflow     : ellipsis;
    overflow          : hidden;
    padding           : 3px;
  }
  .icon               {
    padding           : 0px 5px;
  }
  .options            {
    position          : absolute;
    display           : flex;
    flex-direction    : column;
    align-items       : end;
    top               : 24px;
    left              : 0;
    width             : 250px;
    background-color  : ${styles.appProperties.dropdown_BackgroundColor};
    border            : 1px solid ${styles.appProperties.dropdown_BorderColor};
    border-radius     : 3px;
    border-top        : 0;
  }
  .option {
    margin: 0;
  }
`

module.exports = css
