const domains = {
  'remix-alpha.ethereum.org': 27,
  'remix-beta.ethereum.org': 25,
  'remix.ethereum.org': 23
}
if (domains[window.location.hostname]) {
  var _paq = window._paq = window._paq || []
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['disableCookies']);
  _paq.push(['enableJSErrorTracking']);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function () {
    var u = "https://matomo.ethereum.org/";
    _paq.push(['setTrackerUrl', u + 'matomo.php'])
    _paq.push(['setSiteId', domains[window.location.hostname]])
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0]
    g.type = 'text/javascript'; g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s)
  })()
}

createScriptTag = function (url, type) {
  var script = document.createElement('script');
  script.src = url;
  script.type = type;
  document.getElementsByTagName('head')[0].appendChild(script);
};

function isElectron() {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
      return true
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
      return true
  }

  return false
}

const versionUrl = isElectron() ? 'https://remix.ethereum.org/assets/version.json' : 'assets/version.json'
fetch(versionUrl, { cache: "no-store" }).then(response => {
  response.text().then(function (data) {
    const version = JSON.parse(data);
    console.log(`Loading Remix ${version.version}`);
    createScriptTag(`polyfills.${version.version}.${version.timestamp}.js`, 'module');
    if (version.mode === 'development') {
      createScriptTag(`vendor.${version.version}.${version.timestamp}.js`, 'module');
      createScriptTag(`runtime.${version.version}.${version.timestamp}.js`, 'module');
    }
    createScriptTag(`main.${version.version}.${version.timestamp}.js`, 'text/javascript');
  });
});
