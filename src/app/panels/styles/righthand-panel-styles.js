var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  #righthand-panel {
    display: flex;
    flex-direction: column;
    top: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    overflow: hidden;
  }
  #optionViews {
    background-color: ${styles.rightPanel.backgroundColor_Tab};
    overflow: scroll;
    height: 100%;
  }
  #optionViews > div {
    display: none;
  }
  #optionViews .pre {
    word-wrap: break-word;
    background-color: ${styles.rightPanel.BackgroundColor_Pre};
    border-radius: 3px;
    display: inline-block;
    padding: 0 0.6em;
  }
  #optionViews .hide {
    display: none;
  }
  a {
    color: ${styles.rightPanel.text_link};
  }
  .menu {
    display: flex;
    background-color: ${styles.rightPanel.BackgroundColor_Pre};
  }
  .options {
    float: left;
    padding-top: 0.7em;
    min-width: 60px;
    font-size: 0.9em;
    cursor: pointer;
    font-size: 1em;
    text-align: center;
  }
  .opts {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .opts_li {
    display: block;
    font-weight: bold;
    color: ${styles.rightPanel.text_Teriary};
  }
  .opts_li.active {
    color: ${styles.rightPanel.text_Primary};
  }
  .opts_li:hover {
    color: ${styles.rightPanel.icon_HoverColor_TogglePanel};
  }
  .dragbar             {
    position           : absolute;
    width              : 0.5em;
    top                : 3em;
    bottom             : 0;
    cursor             : col-resize;
    z-index            : 999;
    border-left        : 2px solid ${styles.rightPanel.bar_Dragging};
  }
  .ghostbar           {
    width             : 3px;
    background-color  : ${styles.rightPanel.bar_Ghost};
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
  .panel              {
    height            : 100%;
  }
  .header             {
    height            : 100%;
  }
  .solIcon {
    margin-left: 10px;
    margin-right: 30px;
    display: flex;
    align-self: center;
    height: 29px;
    width: 20px;
    background-color: ${styles.colors.transparent};
  }
`

module.exports = css
