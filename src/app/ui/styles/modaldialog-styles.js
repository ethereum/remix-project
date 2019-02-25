var csjs = require('csjs-inject')

var css = csjs`
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1000; /* Sit on top of everything including the dragbar */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    word-wrap: break-word;
  }
  .modalHeader {
    padding: 2px 16px;
    display: flex;
    justify-content: space-between;
  }
  .modalBody {
    padding: 1.5em;
    line-height: 1.5em;
  }
  .modalBody em {
    color: var(--text-info)
  }
  .modalBody a {
    color: color: var(--text-info)
  }
  .modalFooter {
    display: flex;
    justify-content: flex-end;
    padding: 10px 30px;
    text-align: right;
    font-weight: 700;
    cursor: pointer;
  }
  .modalContent {
    position: relative;
    margin: auto;
    padding: 0;
    line-height: 18px;
    font-size: 14px;
    width: 50%;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 0.4s;
    animation-name: animatetop;
    animation-duration: 0.4s
  }
  .modalFooterOk {
    cursor: pointer;
  }
  .modalFooterCancel {
    margin-left: 1em;
    cursor: pointer;
  }
  .modalClose {
    margin: auto 0;
    cursor: pointer;
  }
  .modalBackground {
    width: 100%;
    height: 100%;
    position: fixed;
    top:0;
  }
  @-webkit-keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
`

module.exports = css
