var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .panel              {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    font-size         : 12px;
    color             : ${styles.terminal.text_Regular_TransactionLog};
    background-color  : ${styles.terminal.backgroundColor_Terminal};
    height            : 100%;
    min-height        : 1.7em;
    overflow          : hidden;
  }
  .bar                {
    display           : flex;
    min-height        : 3em;
    padding           : 2px;
    background-color  : ${styles.terminal.backgroundColor_Menu};
    z-index           : 3;
  }
  .menu               {
    color             : ${styles.terminal.text_Primary};
    position          : relative;
    display           : flex;
    align-items       : center;
    width             : 100%;
    padding           : 5px;
  }
  .clear           {
    margin-left       : 10px;
    margin-right      : 10px; 
    width             : 10px;
    cursor            : pointer;
    color             : ${styles.terminal.icon_Color_TogglePanel};
  }
  .clear:hover              {
    color             : ${styles.terminal.icon_HoverColor_Menu};
  }
  .toggleTerminal              {
    margin-right      : 10px;
    font-size         : 14px;
    font-weight       : bold;
    cursor            : pointer;
    color             : ${styles.terminal.icon_Color_Menu};
  }
  .toggleTerminal:hover              {
    color             : ${styles.terminal.icon_HoverColor_TogglePanel};
  }
  .terminal_container {
    background-color  : ${styles.terminal.backgroundColor_Terminal};
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    overflow-y        : auto;
    font-family       : monospace;
  }
  .terminal_bg     {
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    padding-left      : 5px;
    padding-right     : 5px;
    padding-bottom    : 3px;
    overflow-y        : auto;
    font-family       : monospace;
    background-image  : ${styles.terminal.backgroundImage_Terminal};
    opacity           : 0.1;
    top               : 15%;
    left              : 33%;
    bottom            : 0;
    right             : 0;
    position          : absolute;
    background-repeat : no-repeat;
    background-size   : 45%;
  }
  .terminal    {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .journal            {
    margin-top        : auto;
    font-family       : monospace;
  }
  .block              {
    word-break        : break-all;
    white-space       : pre-wrap;
    line-height       : 2ch;
    margin            : 1ch;
    margin-top        : 2ch;
  }
  .cli                {
    line-height       : 1.7em;
    font-family       : monospace;
    background-color  : ${styles.terminal.backgroundColor_TerminalCLI};
    padding           : .4em;
    color             : ${styles.appProperties.mainText_Color};
    border-top        : solid 2px ${styles.terminal.bar_Ghost};
  }
  .prompt             {
    margin-right      : 0.5em;
    font-family       : monospace;
    font-weight       : bold;
    font-size         : large;
    color             : ${styles.appProperties.supportText_OppositeColor};
  }
  .input              {
    word-break        : break-all;
    outline           : none;
    font-family       : monospace;
  }
  .search {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .filter             {
    ${styles.terminal.input_Search_MenuBar}
    width                       : 200px;
    padding-right               : 0px;
    margin-right                : 0px;
    border-top-left-radius      : 0px;
    border-bottom-left-radius   : 0px;
  }
  .searchIcon {
    background-color            : ${styles.colors.veryLightGrey};
    color                       : ${styles.terminal.icon_Color_Menu};
    height                      : 25px;
    width                       : 25px;
    border-top-left-radius      : 3px;
    border-bottom-left-radius   : 3px;
    display                     : flex;
    align-items                 : center;
    justify-content             : center;
  }
  .listen {
    min-width         : 120px;
    display           : flex;
  }
  .dragbarHorizontal  {
    position          : absolute;
    top               : 0;
    height            : 0.5em;
    right             : 0;
    left              : 0;
    cursor            : ns-resize;
    z-index           : 999;
    border-top        : 2px solid ${styles.terminal.bar_Dragging};
  }
  .ghostbar           {
    position          : absolute;
    height            : 6px;
    background-color  : ${styles.terminal.bar_Ghost};
    opacity           : 0.5;
    cursor            : row-resize;
    z-index           : 9999;
    left              : 0;
    right             : 0;
  }
`

module.exports = css
