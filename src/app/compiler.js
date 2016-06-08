var webworkify = require('webworkify');
var queryParams = require('./query-params');
var utils = require('./utils');
var Renderer = require('./renderer');

var Base64 = require('js-base64').Base64;

function Compiler (editor, handleGithubCall, outputField, hidingRHP, updateFiles) {
  var renderer = new Renderer(editor, this, updateFiles);

  var compileJSON;
  var compilerAcceptsMultipleFiles;

  var previousInput = '';
  var sourceAnnotations = [];

  var cachedRemoteFiles = {};
  var worker = null;

  var compileTimeout = null;

  function onChange () {
    var input = editor.getValue();
    if (input === '') {
      editor.setCacheFileContent('');
      return;
    }
    if (input === previousInput) {
      return;
    }
    previousInput = input;
    if (compileTimeout) {
      window.clearTimeout(compileTimeout);
    }
    compileTimeout = window.setTimeout(compile, 300);
  }

  editor.onChangeSetup(onChange);

  var compile = function (missingInputs) {
    editor.clearAnnotations();
    sourceAnnotations = [];
    outputField.empty();
    var input = editor.getValue();
    editor.setCacheFileContent(input);

    var files = {};
    files[editor.getCacheFile()] = input;
    gatherImports(files, missingInputs, function (input, error) {
      outputField.empty();
      if (input === null) {
        renderer.error(error);
      } else {
        var optimize = queryParams.get().optimize;
        compileJSON(input, optimize ? 1 : 0);
      }
    });
  };
  this.compile = compile;

  this.addAnnotation = function (annotation) {
    sourceAnnotations[sourceAnnotations.length] = annotation;
    editor.setAnnotations(sourceAnnotations);
  };

  function onCompilerLoaded (setVersionText, version) {
    setVersionText(version);
    previousInput = '';
    onChange();
  }

  function onInternalCompilerLoaded (setVersionText) {
    if (worker === null) {
      var compile;
      var missingInputs = [];
      var Module = window.Module;
      if ('_compileJSONCallback' in Module) {
        compilerAcceptsMultipleFiles = true;
        var missingInputsCallback = Module.Runtime.addFunction(function (path, contents, error) {
          missingInputs.push(Module.Pointer_stringify(path));
        });
        var compileInternal = Module.cwrap('compileJSONCallback', 'string', [ 'string', 'number', 'number' ]);
        compile = function (input, optimize) {
          missingInputs.length = 0;
          return compileInternal(input, optimize, missingInputsCallback);
        };
      } else if ('_compileJSONMulti' in Module) {
        compilerAcceptsMultipleFiles = true;
        compile = Module.cwrap('compileJSONMulti', 'string', [ 'string', 'number' ]);
      } else {
        compilerAcceptsMultipleFiles = false;
        compile = Module.cwrap('compileJSON', 'string', [ 'string', 'number' ]);
      }
      compileJSON = function (source, optimize, cb) {
        try {
          var result = compile(source, optimize);
        } catch (exception) {
          result = JSON.stringify({ error: 'Uncaught JavaScript exception:\n' + exception });
        }
        compilationFinished(result, missingInputs);
      };
      onCompilerLoaded(setVersionText, Module.cwrap('version', 'string', [])());
    }
  }

  function compilationFinished (result, missingInputs) {
    var data;
    var noFatalErrors = true; // ie warnings are ok

    try {
      data = JSON.parse(result);
    } catch (exception) {
      renderer.error('Invalid JSON output from the compiler: ' + exception);
      return;
    }

    if (data['error'] !== undefined) {
      renderer.error(data['error']);
      if (utils.errortype(data['error']) !== 'warning') {
        noFatalErrors = false;
      }
    }
    if (data['errors'] !== undefined) {
      data['errors'].forEach(function (err) {
        renderer.error(err);
        if (utils.errortype(err) !== 'warning') {
          noFatalErrors = false;
        }
      });
    }

    if (missingInputs !== undefined && missingInputs.length > 0) {
      compile(missingInputs);
    } else if (noFatalErrors && !hidingRHP()) {
      renderer.contracts(data, editor.getValue());
    }
  }

  this.loadVersion = function (usingWorker, version, setVersionText) {
    var url = 'https://ethereum.github.io/solc-bin/bin/' + version;

    if (usingWorker) {
      loadWorker(url, setVersionText);
    } else {
      loadInternal(url, setVersionText);
    }
  };

  function loadInternal (url, setVersionText) {
    delete window.Module;
    // Set a safe fallback until the new one is loaded
    compileJSON = function (source, optimize) { compilationFinished('{}'); };

    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = url;
    document.getElementsByTagName('head')[0].appendChild(newScript);
    var check = window.setInterval(function () {
      if (!window.Module) {
        return;
      }
      window.clearInterval(check);
      onInternalCompilerLoaded(setVersionText);
    }, 200);
  }

  function loadWorker (url, setVersionText) {
    if (worker !== null) {
      worker.terminate();
    }
    worker = webworkify(require('./compiler-worker.js'));
    worker.addEventListener('message', function (msg) {
      var data = msg.data;
      switch (data.cmd) {
        case 'versionLoaded':
          compilerAcceptsMultipleFiles = !!data.acceptsMultipleFiles;
          onCompilerLoaded(setVersionText, data.data);
          break;
        case 'compiled':
          compilationFinished(data.data, data.missingInputs);
          break;
      }
    });
    worker.onerror = function (msg) { console.log(msg.data); };
    worker.addEventListener('error', function (msg) { console.log(msg.data); });
    compileJSON = function (source, optimize) {
      worker.postMessage({cmd: 'compile', source: source, optimize: optimize});
    };
    worker.postMessage({cmd: 'loadVersion', data: url});
  }

  function gatherImports (files, importHints, cb) {
    importHints = importHints || [];
    if (!compilerAcceptsMultipleFiles) {
      cb(files[editor.getCacheFile()]);
      return;
    }
    var importRegex = /^\s*import\s*[\'\"]([^\'\"]+)[\'\"];/g;
    var reloop = false;
    var githubMatch;
    do {
      reloop = false;
      for (var fileName in files) {
        var match;
        while ((match = importRegex.exec(files[fileName]))) {
          importHints.push(match[1]);
        }
      }
      while (importHints.length > 0) {
        var m = importHints.pop();
        if (m in files) {
          continue;
        }
        if (editor.hasFile(m)) {
          files[m] = window.localStorage[utils.fileKey(m)];
          reloop = true;
        } else if (m.startsWith('./') && editor.hasFile(m.slice(2))) {
          files[m] = window.localStorage[utils.fileKey(m.slice(2))];
          reloop = true;
        } else if (m in cachedRemoteFiles) {
          files[m] = cachedRemoteFiles[m];
          reloop = true;
        } else if ((githubMatch = /^(https?:\/\/)?(www.)?github.com\/([^\/]*\/[^\/]*)\/(.*)/.exec(m))) {
          handleGithubCall(githubMatch[3], githubMatch[4], function (result) {
            if ('content' in result) {
              var content = Base64.decode(result.content);
              cachedRemoteFiles[m] = content;
              files[m] = content;
              gatherImports(files, importHints, cb);
            } else {
              cb(null, 'Unable to import "' + m + '"');
            }
          }).fail(function () {
            cb(null, 'Unable to import "' + m + '"');
          });
          return;
        } else {
          cb(null, 'Unable to import "' + m + '"');
          return;
        }
      }
    } while (reloop);
    cb(JSON.stringify({ 'sources': files }));
  }
}

module.exports = Compiler;
