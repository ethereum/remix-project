var csjs = require('csjs-inject')

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
    padding-left      : 6px;
    padding-top       : 6px;
  }
  .fileExplorerTree   {
    cursor            : default;
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
  .connectToLocalhost {
    padding           : 10px;
  }
  .connectToLocalhost i {
    cursor            : pointer;
  }
  .connectToLocalhost i:hover   {
    color             : var(--secondary)
  }
  .uploadFile         {
    padding           : 10px;
  }
  .uploadFile label:hover   {
    color             : var(--secondary)
  }
  .uploadFile label   {
    cursor            : pointer;
  }
  .treeview {
    overflow-y        : auto;
  }  
  .dialog {
    display: flex;
    flex-direction: column;
  }
  .dialogParagraph {
    margin-bottom: 2em;
    word-break: break-word;
  }
`

module.exports = css
