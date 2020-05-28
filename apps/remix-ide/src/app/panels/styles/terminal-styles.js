var csjs = require('csjs-inject')

var css = csjs`
  .panel              {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    font-size         : 12px;
    min-height        : 3em;
  }
  .bar                {
    display           : flex;
    z-index           : 2;
  }
  .menu               {
    position             : relative;
    display              : flex;
    align-items          : center;
    width                : 100%;
    max-height           : 35px;
    min-height           : 35px;
  }
  .clear           {
    margin-right      : 20px;
    width             : 10px;
    cursor            : pointer;
    display           : flex;
  }
  .clear:hover              {
    color             : var(--secondary);
  }
  .toggleTerminal              {
    margin-right      : 20px;
    margin-left       : 2px;
    font-size         : 14px;
    font-weight       : bold;
    cursor            : pointer;
  }
  .toggleTerminal:hover              {
    color             : var(--secondary);
  }
  .terminal_container   {
    display             : flex;
    flex-direction      : column;
    height              : 100%;
    overflow-y          : auto;
    font-family         : monospace;
    margin              : 0px;
    background-repeat   : no-repeat;
    background-position : center 15%;
    background-size     : auto calc(75% -  1.7em);
  }
  .terminal    {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    height            : 100%;
  }
  .journal            {
    margin-top        : auto;
    font-family       : monospace;
  }
  .block              {
    word-break        : break-word;
    white-space       : pre-wrap;
    line-height       : 2ch;
    padding           : 1ch;
    margin-top        : 2ch;
  }
  .cli                {
    line-height       : 1.7em;
    font-family       : monospace;
    padding           : .4em;
    color             : var(--primary)
    border-top        : solid 2px var(--secondary);
  }
  .prompt             {
    margin-right      : 0.5em;
    font-family       : monospace;
    font-weight       : bold;
    font-size         : 14px;
  }
  .input              {
    word-break        : break-word;
    outline           : none;
    font-family       : monospace;
  }
  .search {
    display           : flex;
    align-items       : center;
    width             : 330px;
    padding-left      : 20px;
    height            : 100%;
    padding-top       : 1px;
    padding-bottom    : 1px;
  }
  .filter                       {
    padding-right               : 0px;
    margin-right                : 0px;
    height                      : 100%;
    white-space                 : nowrap;
    overflow                    : hidden;
    text-overflow               : ellipsis;
  }
  .searchIcon                   {
    height                      : 100%;
    width                       : 25px;
    border-top-left-radius      : 3px;
    border-bottom-left-radius   : 3px;
    display                     : flex;
    align-items                 : center;
    justify-content             : center;
    margin-right                : 5px;
  }
  .listen         {
    margin-right  : 30px;
    min-width     : 40px;
    height        : 13px;
    display       : flex;
    align-items   : center;
  }
  .listenLabel {
    min-width: 50px;
  }
  .verticalLine {
    border-left       : 1px solid var(--secondary)
    height            : 65%;
  }
  .listenOnNetworkLabel {
    white-space       : nowrap;
  }
  .pendingTx {
    border-radius     : 50%;
    margin-right      : 30px;
    min-width         : 13px;
    height            : 13px;
    display           : flex;
    justify-content   : center;
    align-items       : center;
    font-size         : 14px;
    user-select       : none;
  }
  .dragbarHorizontal  {
    position          : absolute;
    top               : 0;
    height            : 0.5em;
    right             : 0;
    left              : 0;
    cursor            : ns-resize;
    z-index           : 999;
  }
  .ghostbar           {
    position          : absolute;
    height            : 6px;
    opacity           : 0.5;
    cursor            : row-resize;
    z-index           : 9999;
    left              : 0;
    right             : 0;
  }
`

module.exports = css
