var csjs = require('csjs-inject')

var css = csjs`
  .analysis {
    display: flex;
    flex-direction: column;
  }
  .result {
    margin-top: 1%;
    max-height: 300px;
    word-break: break-word;
  }
  .buttons  {
    margin: 1rem 0;
  }
  .label {
    display: flex;
    align-items: center;
  }
  .label {
    display: flex;
    align-items: center;
    user-select: none;
  }
  .block input[type='radio']:checked ~ .entries{
    height: auto;
    transition: .5s ease-in;
  }
  .entries{
    height: 0;
    overflow: hidden;
    transition: .5s ease-out;
  }
`

module.exports = css
