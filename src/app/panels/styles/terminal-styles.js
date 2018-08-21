var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
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
  }
  .clear           {
    margin-right      : 20px;
    width             : 10px;
    cursor            : pointer;
    color             : ${styles.terminal.icon_Color_TogglePanel};
    display           : flex;
  }
  .clear:hover              {
    color             : ${styles.terminal.icon_HoverColor_Menu};
  }
  .toggleTerminal              {
    margin-right      : 20px;
    margin-left       : 20px;
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
    margin            : 0px;
    background-image    : ${styles.terminal.backgroundImage_Terminal};
    background-repeat   : no-repeat;
    background-position : center 15%;
    background-size     : auto calc(75% -  1.7em);
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
    padding           : 1ch;
    margin-top        : 2ch;
    border-top        : 0.07ch solid ${styles.colors.veryLightGrey};
    color             : ${styles.appProperties.mainText_Color};
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
    font-size         : 14px;
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
  .listen {}
  .verticalLine {
    border-left       : 1px solid ${styles.colors.veryLightGrey};
    height            : 65%;
    margin-right      : 30px;   }
  .pendingTx {
    border            : 1px solid ${styles.terminal.icon_HoverColor_Menu};
    border-radius: 50%;
    margin-right: 30px;
    min-width: 13px;
    height: 13px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
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
