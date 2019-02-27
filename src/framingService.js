export default {
  start: (appStore, swapPanelApi, verticalIconApi, mainPanelApi, resizeFeature) => {
    swapPanelApi.event.on('toggle', (moduleName) => {
      resizeFeature.panel1.clientWidth !== 0 ? resizeFeature.minimize() : resizeFeature.maximise()
      if (moduleName === 'fileExplorers') {
        mainPanelApi.showContent('code editor')
      }
    })
    swapPanelApi.event.on('showing', (moduleName) => {
      if (moduleName === 'fileExplorers') {
        mainPanelApi.showContent('code editor')
      }
      resizeFeature.panel1.clientWidth === 0 ? resizeFeature.maximise() : ''
      var current = appStore.getOne(moduleName)
      // warn the content that it is being displayed. TODO should probably be done in each view
      if (current && current.api.__showing) current.api.__showing()
    })
    mainPanelApi.event.on('toggle', () => {
      verticalIconApi.select('code editor')
      resizeFeature.maximise()
    })
    // mainPanelApi.event.on('showing', (moduleName) => {})

    verticalIconApi.select('fileExplorers')
    verticalIconApi.select('homepage')
    resizeFeature.minimize()
  }
}
