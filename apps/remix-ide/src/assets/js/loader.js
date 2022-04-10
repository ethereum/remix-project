createScriptTag = function(url, type) {
  var script = document.createElement('script');
  script.src = url;
  script.type = type;
  document.getElementsByTagName('head')[0].appendChild(script);
};

fetch('assets/version.json').then(response => {
  response.text().then(function(data) {
    const version = JSON.parse(data).version;
    console.log(`Loading Remix ${version}`);
    createScriptTag(`main.${version}.js`, 'text/javascript');
    createScriptTag(`polyfills.${version}.js`, 'module');
    if (version.includes('dev')) {
      createScriptTag(`vendor.${version}.js`, 'module');
      createScriptTag(`runtime.js`, 'module');
    }
  });
});
