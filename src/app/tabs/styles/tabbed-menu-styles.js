const csjs = require('csjs-inject')

const css = csjs`
  .menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .active {
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
    overflow: scroll;
    height: 100%;
  }
  .optionViews > div {
    display: none;
  }
  .optionViews .pre {
    word-wrap: break-word;
    border-radius: 3px;
    display: inline-block;
    padding: 0 0.6em;
  }
`

module.exports = css
