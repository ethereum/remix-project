import './index'

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
    (function() {
        var u="https://matomo.ethereum.org/";
        _paq.push(['setTrackerUrl', u+'matomo.php'])
        _paq.push(['setSiteId', domains[window.location.hostname]])
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]
        g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s)
    })()
}