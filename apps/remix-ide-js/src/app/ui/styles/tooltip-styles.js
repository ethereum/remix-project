var csjs = require('csjs-inject')

var css = csjs`
  .tooltip {
    z-index: 1001;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    min-height: 50px;
    padding: 16px 24px 12px;
    border-radius: 3px;
    bottom: -300;
    left: 40%;
    font-size: 14px;
    text-align: center;
    bottom: 0;
    flex-direction: row;
  }
  @-webkit-keyframes animatebottom  {
    0% {bottom: -300px}
    100% {bottom: 0}
  }
  @keyframes animatebottom  {
    0% {bottom: -300px}
    100% {bottom: 0}
  }
  @-webkit-keyframes animatetop  {
    0% {bottom: 0}
    100% {bottom: -300px}
  }
  @keyframes animatetop  {
    0% {bottom: 0}
    100% {bottom: -300px}
  }
  .animateTop {
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 2s;
    animation-name: animatetop;
    animation-duration: 2s;
  }
  .animateBottom {
    -webkit-animation-name: animatebottom;
    -webkit-animation-duration: 2s;
    animation-name: animatebottom;
    animation-duration: 2s;    
  }
`

module.exports = css
