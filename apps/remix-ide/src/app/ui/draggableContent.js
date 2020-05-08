'use strict'
var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .containerDraggableModal {
    position: absolute;
    z-index: 1000;
    text-align: center;
    width: 500px;
    height: 500px;
    overflow-y: hidden;
  }

  .headerDraggableModal {
    cursor: move;
    z-index: 10;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }
  
  .modalActions {
    float: right;
  }

  .modalAction {
    padding-right: 1px;
    padding-left: 1px;
    cursor: pointer;
  }
`

module.exports =
  class DraggableContent {
    constructor (closeCb) {
      this.closeCb = closeCb
      this.isMaximised = false
    }

    render (title, url, content) {
      this.content = content
      var el = yo`
    <div class=${css.containerDraggableModal}>
      <div>
          <div class="${css.headerDraggableModal} title" title=${title}><span title="${title}" >${title}</span><span title="${url}" > - ${url}</span>
            <div class=${css.modalActions}>
              <i onclick=${() => { this.minimize() }} class="fas fa-window-minimize ${css.modalAction}"></i>
              <i onclick=${() => { this.maximise() }} class="fas fa-window-maximize ${css.modalAction}"></i>
              <i onclick=${() => { this.close() }} class="fas fa-window-close-o ${css.modalAction}"></i>
            </div>
          </div>
        </div>
      ${content}
    </div>   `
      dragElement(el)
      el.style.top = '20%'
      el.style.left = '50%'
      this.el = el
      return el
    }
    setTitle (title) {
      this.el.querySelector('.title span').innerHTML = title
    }
    minimize () {
      this.isMaximised = false
      this.content.style.display = 'none'
      this.el.style.height = 'inherit'
      this.el.style.width = '150px'
      this.el.querySelector('.title').style.width = '146px'
    }
    maximise () {
      this.content.style.display = 'block'
      var body = document.querySelector('body')
      this.el.style.height = this.isMaximised ? '500px' : body.offsetHeight + 'px'
      this.el.style.width = this.isMaximised ? '500px' : body.offsetWidth + 'px'
      this.isMaximised = !this.isMaximised
      this.el.style.top = this.isMaximised ? '0%' : '20%'
      this.el.style.left = this.isMaximised ? '0%' : '50%'
      this.el.querySelector('.title').style.width = 'inherit'
    }
    close () {
      if (this.closeCb) this.closeCb()
      if (this.el.parentElement) {
        this.el.parentElement.removeChild(this.el)
      }
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
    if (e.button !== 0) return
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
    /* stop moving when mouse button is released: */
    document.onmouseup = null
    document.onmousemove = null
  }
}
