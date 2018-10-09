var csjs = require('csjs-inject')
var styleGuide = require('../styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .popup             {
    text-align       : center;
    z-index          : 1;
    position         : absolute;
    width            : 100%;
    justify-content  : center;
    bottom           : 0;
    margin-bottom    : 32px;
    border-radius    : 6px;
    padding          : 8px 0;
    opacity          : 0.8;
  }

  .popupcontent {
    display          : block;
    position         : absolute;
    background-color : #f1f1f1;
    width            : 100%;
    box-shadow       : 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index          : 1;
    bottom           : 100%;
  }

  .popupcontent a {
    color            : ${styles.terminal.text_Primary};
    font-family      : monospace;
    font-size        : 10px;
    display          : block;
    cursor           : pointer;
  }

  .popupcontent div  {
    font-family      : monospace;
    font-size        : 10px;
  }

  .popupcontent a:hover {
    background-color : #ddd;
  }

  .listHandlerShow   {
    display          : block;
  }

  .listHandlerHide   {
    display          : none;
  }

  .listHandlerButtonShow {
    display          : inline;
    float            : center;
    opacity          : 0.8;
  }

  .pageNumberAlignment {
    display          : inline;
    position         : absolute;
    padding-right    : 10px;
    font-family      : monospace;
    font-size        : 10px;
    margin-left      : 30%;
  }
`
module.exports = css
