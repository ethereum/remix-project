const yo = require('yo-yo')
const csjs = require('csjs-inject')
const styleGuide = require('../app/ui/styles-guide/theme-chooser')
const styles = styleGuide.chooser()

const css = csjs`
  .dragbar            {
    position          : absolute;
    top               : 29px;
    width             : 0.5em;
    right             : 0;
    bottom            : 0;
    cursor            : col-resize;
    z-index           : 999;
    border-right      : ${styles.leftPanel.dragbarBorderRight};
  }
  .ghostbar           {
    width             : 3px;
    background-color  : ${styles.colors.lightBlue};
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
`

export default class PanelsResize {
  constructor (idpanel1, idpanel2, opt) {
    var panel1 = document.querySelector(idpanel1)
    var panel2 = document.querySelector(idpanel2)

    var ghostbar = yo`<div class=${css.ghostbar}></div>`

    let mousedown = (event) => {
      event.preventDefault()
      if (event.which === 1) {
        moveGhostbar(event)
        document.body.appendChild(ghostbar)
        document.addEventListener('mousemove', moveGhostbar)
        document.addEventListener('mouseup', removeGhostbar)
        document.addEventListener('keydown', cancelGhostbar)
      }
    }

    let cancelGhostbar = (event) => {
      if (event.keyCode === 27) {
        document.body.removeChild(ghostbar)
        document.removeEventListener('mousemove', moveGhostbar)
        document.removeEventListener('mouseup', removeGhostbar)
        document.removeEventListener('keydown', cancelGhostbar)
      }
    }

    let moveGhostbar = (event) => { // @NOTE VERTICAL ghostbar
      let p = processPositiions(event)
      if (p.panel1Width <= opt.minWidth || p.panel2Width <= opt.minWidth) return
      ghostbar.style.left = event.x + 'px'
    }

    let removeGhostbar = (event) => {
      document.body.removeChild(ghostbar)
      document.removeEventListener('mousemove', moveGhostbar)
      document.removeEventListener('mouseup', removeGhostbar)
      document.removeEventListener('keydown', cancelGhostbar)
      let p = processPositiions(event)
      panel1.style.width = p.panel1Width + 'px'
      panel2.style.left = p.panel2left + 'px'
      panel2.style.width = p.panel2Width + 'px'
    }

    let processPositiions = (event) => {
      let panel1Width = event.x - panel1.offsetLeft
      panel1Width = panel1Width < opt.minWidth ? opt.minWidth : panel1Width
      let panel2left = panel1.offsetLeft + panel1Width
      let panel2Width = panel2.parentElement.clientWidth - panel1.offsetLeft - panel1Width
      panel2Width = panel2Width < opt.minWidth ? opt.minWidth : panel2Width
      return { panel1Width, panel2left, panel2Width }
    }

    var dragbar = yo`<div onmousedown=${mousedown} class=${css.dragbar}></div>`
    panel1.appendChild(dragbar)
  }
}
