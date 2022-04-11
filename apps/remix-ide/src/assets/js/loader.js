createScriptTag = function(url, type) {
  var script = document.createElement('script');
  script.src = url;
  script.type = type;
  document.getElementsByTagName('head')[0].appendChild(script);
};
fetch('assets/version.json').then(response => {
  response.text().then(function(data) {
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
