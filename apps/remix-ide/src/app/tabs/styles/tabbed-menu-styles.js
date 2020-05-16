const csjs = require('csjs-inject')
const styles = require('../../ui/styles-guide/theme-chooser').chooser()

const css = csjs`
  .menu {
    display: flex;
    background-color: ${styles.rightPanel.BackgroundColor_Pre};
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .active {
    background-color: ${styles.rightPanel.backgroundColor_Tab};
    color: ${styles.appProperties.mainText_Color}
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
  .optionViews {
    background-color: ${styles.rightPanel.backgroundColor_Tab};
    overflow: scroll;
    height: 100%;
  }
  .optionViews > div {
    display: none;
  }
  .optionViews .pre {
    word-wrap: break-word;
    background-color: ${styles.rightPanel.BackgroundColor_Pre};
    border-radius: 3px;
    display: inline-block;
    padding: 0 0.6em;
  }
`

module.exports = css
