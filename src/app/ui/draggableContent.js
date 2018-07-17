'use strict'
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var styleGuide = require('./styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .containerDraggableModal {
    position: absolute;
    z-index: 1000;
    background-color: ${styles.appProperties.quaternary_BackgroundColor};
    text-align: center;
    width: 500px;
    height: 500px;
    border: 2px solid ${styles.appProperties.solidBorderBox_BorderColor};
  }

  .headerDraggableModal {
    padding: 10px;
    cursor: move;
    z-index: 10;
    color: ${styles.appProperties.mainText_Color};
    background-color: ${styles.appProperties.quaternary_BackgroundColor};
    border-bottom: 2px solid ${styles.appProperties.solidBorderBox_BorderColor};
  }
`

module.exports =
  class DraggableContent {
    render (title, content) {
      var el = yo`
    <div class=${css.containerDraggableModal} >
      <div class="${css.headerDraggableModal} title">${title}</div>
      ${content}
    </div>   `
      dragElement(el)
      el.style.top = '20%'
      el.style.left = '50%'
      this.el = el
      return el
    }
    setTitle (title) {
      this.el.querySelector('.title').innerHTML = title
    }
}

function dragElement (elmnt) {
  var pos1 = 0
  var pos2 = 0
  var pos3 = 0
  var pos4 = 0

  elmnt.querySelector('.title').onmousedown = dragMouseDown

  function dragMouseDown (e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  function elementDrag (e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
  }

  function closeDragElement () {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null
    document.onmousemove = null
  }
}
