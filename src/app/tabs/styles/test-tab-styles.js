var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
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
.solIcon {
  margin-left: 10px;
  margin-right: 30px;
  display: flex;
  align-self: center;
  height: 29px;
  width: 20px;
  background-color: ${styles.colors.transparent};
}
a {
  color: ${styles.rightPanel.text_link};
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
.infoBox  {
  ${styles.infoTextBox}
  margin-bottom: 1em;
}
.textBox  {
  ${styles.textBoxL}
  margin-bottom: 1em;
}
.icon {
  height: 70%;
  margin-right: 2%;
}
`

module.exports = css
