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
    resizeFeature.minimize()
  }
}
