var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var cssTabs = yo`
  <style>
    #files .file {
      padding: 0 0.6em;
      box-sizing: border-box;
      background-color: ${styles.editor.backgroundColor_Tabs_Highlights};
      cursor: pointer;
      margin-right: 10px;
      margin-top: 5px;
      position: relative;
      display: table-cell;
      text-align: center;
      vertical-align: middle;
      color: ${styles.editor.text_Teriary};
    }
    #files .file.active {
      color: ${styles.editor.text_Primary};
      font-weight: bold;
      border-bottom: 0 none;
      padding-right: 1.5em;
    }
    #files .file .remove {
      font-size: 12px;
      display: flex;
      color: ${styles.editor.text_Primary};
      position: absolute;
      top: -7px;
      right: 5px;
      display: none;
    }
    #files .file input {
      background-color: ${styles.colors.transparent};
      border: 0 none;
      border-bottom: 1px dotted ${styles.editor.text_Primary};
      line-height: 1em;
      margin: 0.5em 0;
    }
    #files .file.active .remove {
      display: inline-block;
      color: ${styles.editor.text_Primary};
    }
  </style>
`

var css = csjs`
  .editorpanel         {
    display            : flex;
    flex-direction     : column;
    height             : 100%;
  }
  .tabsbar             {
    background-color   : ${styles.editor.backgroundColor_Panel};
    display            : flex;
    overflow           : hidden;
    height             : 30px;
  }
  .tabs               {
    position          : relative;
    display           : flex;
    margin            : 0;
    left              : 10px;
    margin-right      : 10px;
    width             : 100%;
    overflow          : hidden;
  }
  .files              {
    display           : flex;
    position          : relative;
    list-style        : none;
    margin            : 0;
    font-size         : 15px;
    height            : 2.5em;
    box-sizing        : border-box;
    line-height       : 2em;
    top               : 0;
    border-bottom     : 0 none;
  }
  .changeeditorfontsize {
    margin            : 0;
    font-size         : 9px;
    margin-top        : 0.5em;
  }
  .changeeditorfontsize i {
    cursor            : pointer;
    display           : block;
    color             : ${styles.editor.icon_Color_Editor};
  }
  .changeeditorfontsize i {
    cursor            : pointer;
  }
  .changeeditorfontsize i:hover {
    color             : ${styles.editor.icon_HoverColor_Editor};
  }
  .buttons            {
    display           : flex;
    flex-direction    : row;
    justify-content   : space-around;
    align-items       : center;
    min-width         : 45px;
  }
  .toggleLHP          {
    display           : flex;
    padding           : 10px;
    width             : 100%;
    font-weight       : bold;
    color             : ${styles.leftPanel.icon_Color_TogglePanel};
  }
  .toggleLHP i        {
    cursor            : pointer;
    font-size         : 14px;
    font-weight       : bold;
  }
  .toggleLHP i:hover  {
    color             : ${styles.leftPanel.icon_HoverColor_TogglePanel};
  }
  .scroller           {
    position          : absolute;
    z-index           : 999;
    text-align        : center;
    cursor            : pointer;
    vertical-align    : middle;
    background-color  : ${styles.colors.general_BackgroundColor};
    height            : 100%;
    font-size         : 1.3em;
    color             : orange;
  }
  .scrollerright      {
    right             : 0;
    margin-right      : 15px;
  }
  .scrollerleft       {
    left              : 0;
  }
  .toggleRHP          {
    margin            : 0.5em;
    font-weight       : bold;
    color             : ${styles.rightPanel.icon_Color_TogglePanel};
    right             : 0;
  }
  .toggleRHP i        {
    cursor            : pointer;
    font-size         : 14px;
    font-weight       : bold;
  }
  .toggleRHP i:hover  {
    color             : ${styles.rightPanel.icon_HoverColor_TogglePanel};
  }
  .show               {
    opacity           : 1;
    transition        : .3s opacity ease-in;
  }
  .hide               {
    opacity           : 0;
    pointer-events    : none;
    transition        : .3s opacity ease-in;
  }
  .content            {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    width             : 100%;
  }
  .contextviewcontainer{
    width             : 100%;
    height            : 20px;
    background-color  : ${styles.editor.backgroundColor_Tabs_Highlights};
  }
`

module.exports = {
  cssTabs: cssTabs,
  css: css
}
