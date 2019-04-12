export default {
  start: (appStore, swapPanelApi, verticalIconApi, mainPanelApi, resizeFeature) => {
    swapPanelApi.event.on('toggle', () => {
      resizeFeature.panel1.clientWidth !== 0 ? resizeFeature.minimize() : resizeFeature.maximise()
    })
    swapPanelApi.event.on('showing', () => {
      resizeFeature.panel1.clientWidth === 0 ? resizeFeature.maximise() : ''
    })
    mainPanelApi.event.on('toggle', () => {
      resizeFeature.maximise()
    })
    // mainPanelApi.event.on('showing', (moduleName) => {})

    verticalIconApi.select('fileExplorers')
    mainPanelApi.showContent('home')

    document.addEventListener('keypress', (e) => {
      if (e.shiftKey && e.ctrlKey) {
        if (e.code === 'KeyF') { // Ctrl+Shift+F
          verticalIconApi.select('fileExplorers')
        } else if (e.code === 'KeyA') { // Ctrl+Shift+A
          verticalIconApi.select('pluginManager')
        } else if (e.code === 'KeyS') { //  Ctrl+Shift+S
          verticalIconApi.select('settings')
        }
        e.preventDefault()
      }
    })
  }
}
