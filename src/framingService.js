export default {
  start: (appStore, sidePanel, verticalIcon, mainPanel, resizeFeature) => {
    sidePanel.events.on('toggle', () => {
      resizeFeature.panel1.clientWidth !== 0 ? resizeFeature.minimize() : resizeFeature.maximise()
    })
    sidePanel.events.on('showing', () => {
      resizeFeature.panel1.clientWidth === 0 ? resizeFeature.maximise() : ''
    })
    mainPanel.events.on('toggle', () => {
      resizeFeature.maximise()
    })

    verticalIcon.select('fileExplorers')
    verticalIcon.showHome()

    document.addEventListener('keypress', (e) => {
      if (e.shiftKey && e.ctrlKey) {
        if (e.code === 'KeyF') { // Ctrl+Shift+F
          verticalIcon.select('fileExplorers')
        } else if (e.code === 'KeyA') { // Ctrl+Shift+A
          verticalIcon.select('pluginManager')
        } else if (e.code === 'KeyS') { //  Ctrl+Shift+S
          verticalIcon.select('settings')
        }
        e.preventDefault()
      }
    })
  }
}
