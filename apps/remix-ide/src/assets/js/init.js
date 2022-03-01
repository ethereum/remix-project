/* eslint-disable prefer-promise-reject-errors */
function urlParams() {
  var qs = window.location.hash.substr(1)

  if (window.location.search.length > 0) {
    // use legacy query params instead of hash
    window.location.hash = window.location.search.substr(1)
    window.location.search = ''
  }

  var params = {}
  var parts = qs.split('&')
  for (var x in parts) {
    var keyValue = parts[x].split('=')
    if (keyValue[0] !== '') {
      params[keyValue[0]] = keyValue[1]
    }
  }
  return params
}
const defaultVersion = '0.8.0'
const versionToLoad = urlParams().appVersion ? urlParams().appVersion : defaultVersion

const assets = {
  '0.8.0': ['https://use.fontawesome.com/releases/v5.8.1/css/all.css', 'assets/css/pygment_trac.css'],
  '0.7.7': ['assets/css/font-awesome.min.css', 'assets/css/pygment_trac.css']
}
const versions = {
  '0.7.7': 'assets/js/0.7.7/app.js', // commit 7b5c7ae3de935e0ccc32eadfd83bf7349478491e
  '0.8.0': 'main.js'
}
for (const k in assets[versionToLoad]) {
  const app = document.createElement('link')
  app.setAttribute('rel', 'stylesheet')
  app.setAttribute('href', assets[versionToLoad][k])
  if (assets[versionToLoad][k] === 'https://use.fontawesome.com/releases/v5.8.1/css/all.css') {
    app.setAttribute('integrity', 'sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf')
    app.setAttribute('crossorigin', 'anonymous')
  }
  document.head.appendChild(app)
}

window.onload = () => {
  function loadApp() {
    const app = document.createElement('script')
    app.setAttribute('src', versions[versionToLoad])
    document.body.appendChild(app)
  }

  loadApp()
  return
}
