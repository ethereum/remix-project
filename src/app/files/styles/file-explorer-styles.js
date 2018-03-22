var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .fileexplorer       {
    box-sizing        : border-box;
  }
  input[type="file"] {
      display: none;
  }
  .folder,
  .file               {
    font-size         : 14px;
    cursor            : pointer;
  }
  .file               {
    color             : ${styles.leftPanel.text_Teriary};
  }
  .hasFocus           {
    background-color  : ${styles.leftPanel.backgroundColor_FileExplorer};
  }
  .rename             {
    background-color  : ${styles.leftPanel.backgroundColor_Panel};
  }
  .remove             {
    margin-left       : auto;
    padding-left      : 5px;
    padding-right     : 5px;
  }
  .activeMode         {
    display           : flex;
    width             : 100%;
    margin-right      : 10px;
    padding-right     : 19px;
  }
  .activeMode > div   {
    min-width         : 10px;
  }
  ul                  {
    padding           : 0;
  }
`

module.exports = css
