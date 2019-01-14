var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .container {
    display           : flex;
    flex-direction    : row;
    width             : 100%;
    height            : 100%;
    box-sizing        : border-box;
  }
  .fileexplorer       {
    display           : flex;
    flex-direction    : column;
    position          : relative;
    width             : 100%;
  }
  .menu               {
    margin-top        : -0.2em;
    flex-shrink       : 0;
    display           : flex;
    flex-direction    : row;
    min-width         : 160px;
  }
  .newFile            {
    padding           : 10px;
  }
  .newFile i          {
    cursor            : pointer;
  }
  .newFile i:hover    {
    color             : ${styles.colors.orange};
  }
  .gist            {
    padding           : 10px;
  }
  .gist i          {
    cursor            : pointer;
  }
  .gist i:hover    {
    color             : orange;
  }
  .copyFiles            {
    padding           : 10px;
  }
  .copyFiles i          {
    cursor            : pointer;
  }
  .copyFiles i:hover    {
    color             : orange;
  }
  .connectToLocalhost {
    padding           : 10px;
  }
  .connectToLocalhost i {
    cursor            : pointer;
  }
  .connectToLocalhost i:hover   {
    color             : ${styles.colors.orange};
  }
  .uploadFile         {
    padding           : 10px;
  }
  .uploadFile label:hover   {
    color             : ${styles.colors.orange};
  }
  .uploadFile label   {
    cursor            : pointer;
  }
  .treeview {
    background-color  : ${styles.colors.general_BackgroundColor};
  }
  .treeviews {
    overflow-y        : auto;
  }  
  .dialog {
    display: flex;
    flex-direction: column;
  }
  .dialogParagraph {
    ${styles.infoTextBox}
    margin-bottom: 2em;
    word-break: break-word;
  }
`

module.exports = css
