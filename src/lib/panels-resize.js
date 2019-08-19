const yo = require('yo-yo')
const csjs = require('csjs-inject')

const css = csjs`
  .dragbar            {
    width             : 1px;
    height            : 100%;
    cursor            : col-resize;
    z-index           : 999;
  }
  .ghostbar           {
    width             : 3px;
    background-color  : var(--primary);
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
`

export default class PanelsResize {
  constructor (panel) {
    this.panel = panel
    let self = this;
    const string = panel.style.minWidth
    this.minWidth = string.length > 2 ? parseInt(string.substring(0, string.length - 2)) : 0
    window.addEventListener('resize', function (event) {
      self.setPosition(event)
    })
  }

  render () {
    this.ghostbar = yo`<div class=${css.ghostbar}></div>`

    let mousedown = (event) => {
      event.preventDefault()
      if (event.which === 1) {
        moveGhostbar(event)
        document.body.appendChild(this.ghostbar)
        document.addEventListener('mousemove', moveGhostbar)
        document.addEventListener('mouseup', removeGhostbar)
        document.addEventListener('keydown', cancelGhostbar)
      }
    }
    
    let cancelGhostbar = (event) => {
      if (event.keyCode === 27) {
        document.body.removeChild(this.ghostbar)
        document.removeEventListener('mousemove', moveGhostbar)
        document.removeEventListener('mouseup', removeGhostbar)
        document.removeEventListener('keydown', cancelGhostbar)
      }
    }

    let moveGhostbar = (event) => {
      this.ghostbar.style.left = event.x + 'px'
    }

    let removeGhostbar = (event) => {
      document.body.removeChild(this.ghostbar)
      document.removeEventListener('mousemove', moveGhostbar)
      document.removeEventListener('mouseup', removeGhostbar)
      document.removeEventListener('keydown', cancelGhostbar)
      this.setPosition(event)
    }

    return yo`<div onmousedown=${mousedown} class=${css.dragbar}></div>`
  }

  calculatePanelWidth (event) {
    return event.x - this.panel.offsetLeft
  }

  setPosition (event) {
    let panelWidth = this.calculatePanelWidth(event)
    // close the panel if the width is less than a minWidth
    if (panelWidth > this.minWidth - 10 || this.panel.style.display == 'none') {
      this.panel.style.width = panelWidth + 'px'
      this.showPanel()
    } else this.hidePanel()
  }

  hidePanel () {
    this.panel.style.display = 'none'
  }

  showPanel () {
    this.panel.style.display = 'flex'
  }
}

