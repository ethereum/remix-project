var $ = require('jquery');
var web3 = require('./web3-adapter.js');

var utils = require('./app/utils');
var queryParams = require('./app/query-params');
var gistHandler = require('./app/gist-handler');

var StorageHandler = require('./app/storage-handler');
var Editor = require('./app/editor');
var Compiler = require('./app/compiler');

// The event listener needs to be registered as early as possible, because the
// parent will send the message upon the "load" event.
var filesToLoad = null;
var loadFilesCallback = function(files) { filesToLoad = files; }; // will be replaced later
window.addEventListener("message", function(ev) {
	if (typeof ev.data == typeof [] && ev.data[0] === "loadFiles") {
		loadFilesCallback(ev.data[1]);
	}
}, false);

var run = function() {

	function loadFiles(files) {
		for (var f in files) {
			var key = utils.fileKey(f);
			var content = files[f].content;
			if (key in window.localStorage && window.localStorage[key] != content) {
				var count = '';
				var otherKey = key + count;
				while ((key + count) in window.localStorage) count = count - 1;
				window.localStorage[key + count] = window.localStorage[key];
			}
			window.localStorage[key] = content;
		}
		editor.setCacheFile(Object.keys(files)[0]);
		updateFiles();
	}

	loadFilesCallback = function(files) {
		loadFiles(files);
	};

	if (filesToLoad !== null)
		loadFiles(filesToLoad);


	// ------------------ query params (hash) ----------------

	function syncQueryParams() {
	  $('#optimize').attr( 'checked', (queryParams.get().optimize == "true") );
	}

	window.onhashchange = syncQueryParams;
	syncQueryParams();


	// ------------------ gist load ----------------

	var loadingFromGist = gistHandler.handleLoad(function(gistId) {
		$.ajax({
	    url: 'https://api.github.com/gists/'+gistId,
	    jsonp: 'callback',
	    dataType: 'jsonp',
	    success: function(response) {
				if (response.data) {
					if (!response.data.files) {
						alert( "Gist load error: " + response.data.message );
						return;
					}
					loadFiles(response.data.files);
				}
	    }
    });
	});


	// ----------------- storage --------------------

	var storageHandler = new StorageHandler(updateFiles);
	window.syncStorage = storageHandler.sync;
	storageHandler.sync();


	// ----------------- editor ----------------------

	var editor = new Editor(loadingFromGist);


	// ----------------- tabbed menu -------------------

	$('#options li').click(function(ev){
		var $el = $(this);
		var match = /[a-z]+View/.exec( $el.get(0).className );
		if (!match) return;
		var cls = match[0];
		if (!$el.hasClass('active')) {
			$el.parent().find('li').removeClass('active');
			$('#optionViews').attr('class', '').addClass(cls);
			$el.addClass('active');
		} else {
			$el.removeClass('active');
			$('#optionViews').removeClass(cls);
		}
	});


	// ------------------ gist publish --------------

	$('#gist').click(function(){
		if (confirm("Are you sure you want to publish all your files anonymously as a public gist on github.com?")) {

			var files = editor.packageFiles();
			var description = "Created using browser-solidity: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/browser-solidity/#version=" + queryParams.get().version + "&optimize="+ queryParams.get().optimize +"&gist=";

			$.ajax({
				url: 'https://api.github.com/gists',
				type: 'POST',
				data: JSON.stringify({
					description: description,
					public: true,
					files: files
				})
			}).done(function(response) {
				if (response.html_url && confirm("Created a gist at " + response.html_url + " Would you like to open it in a new window?")) {
					window.open( response.html_url, '_blank' );
				}
			});
		}
	});

	$('#copyOver').click(function(){
		var target = prompt(
			"To which other browser-solidity instance do you want to copy over all files?",
			"https://ethereum.github.io/browser-solidity/"
		);
		if (target === null)
			return;
		var files = editor.packageFiles();
		var iframe = $('<iframe/>', {src: target, style: "display:none;", load: function() {
			this.contentWindow.postMessage(["loadFiles", files], "*");
		}}).appendTo('body');
	});

	// ----------------- file selector-------------

	var $filesEl = $('#files');
	var FILE_SCROLL_DELTA = 300;

	$('.newFile').on('click', function() {
		editor.newFile();
		updateFiles();

		$filesEl.animate({left: Math.max( (0 - activeFilePos() + (FILE_SCROLL_DELTA/2)), 0)+ "px"}, "slow", function(){
			reAdjust();
		});
	});

	$filesEl.on('click', '.file:not(.active)', showFileHandler);

	$filesEl.on('click', '.file.active', function(ev) {
		var $fileTabEl = $(this);
		var originalName = $fileTabEl.find('.name').text();
		ev.preventDefault();
		if ($(this).find('input').length > 0) return false;
		var $fileNameInputEl = $('<input value="'+originalName+'"/>');
		$fileTabEl.html($fileNameInputEl);
		$fileNameInputEl.focus();
		$fileNameInputEl.select();
		$fileNameInputEl.on('blur', handleRename);
		$fileNameInputEl.keyup(handleRename);

		function handleRename(ev) {
			ev.preventDefault();
			if (ev.which && ev.which !== 13) return false;
			var newName = ev.target.value;
			$fileNameInputEl.off('blur');
			$fileNameInputEl.off('keyup');

			if (newName !== originalName && confirm("Are you sure you want to rename: " + originalName + " to " + newName + '?')) {
				var content = window.localStorage.getItem( utils.fileKey(originalName) );
				window.localStorage[utils.fileKey( newName )] = content;
				window.localStorage.removeItem( utils.fileKey( originalName) );
				editor.setCacheFile(newName);
			}

			updateFiles();
			return false;
		}

		return false;
	});

	$filesEl.on('click', '.file .remove', function(ev) {
		ev.preventDefault();
		var name = $(this).parent().find('.name').text();

		if (confirm("Are you sure you want to remove: " + name + " from local storage?")) {
			window.localStorage.removeItem( utils.fileKey( name ) );
			editor.setNextFile(utils.fileKey(name));
			updateFiles();
		}
		return false;
	});

	function showFileHandler(ev) {
		ev.preventDefault();
		editor.setCacheFile($(this).find('.name').text());
		updateFiles();
		return false;
	}

	function activeFileTab() {
		var name = editor.getCacheFile();
		return $('#files .file').filter(function(){ return $(this).find('.name').text() == name; });
	}


	function updateFiles() {
		var $filesEl = $('#files');
		var files = editor.getFiles();

		$filesEl.find('.file').remove();

		for (var f in files) {
			$filesEl.append(fileTabTemplate(files[f]));
		}

		if (editor.cacheFileIsPresent()) {
			var active = activeFileTab();
			active.addClass('active');
			editor.resetSession();
		}
		$('#input').toggle( editor.cacheFileIsPresent() );
		$('#output').toggle( editor.cacheFileIsPresent() );
		reAdjust();
	}

	function fileTabTemplate(key) {
		var name = utils.fileNameFromKey(key);
		return $('<li class="file"><span class="name">'+name+'</span><span class="remove"><i class="fa fa-close"></i></span></li>');
	}

	var $filesWrapper = $('.files-wrapper');
	var $scrollerRight = $('.scroller-right');
	var $scrollerLeft = $('.scroller-left');

	function widthOfList (){
		var itemsWidth = 0;
		$('.file').each(function(){
			var itemWidth = $(this).outerWidth();
			itemsWidth += itemWidth;
		});
		return itemsWidth;
	}

	function widthOfHidden(){
		return ($filesWrapper.outerWidth() - widthOfList() - getLeftPosi());
	}

	function widthOfVisible(){
		return $filesWrapper.outerWidth();
	}

	function getLeftPosi(){
		return $filesEl.position().left;
	}

	function activeFilePos() {
		var el = $filesEl.find('.active');
		var l = el.position().left;
		return l;
	}

	function reAdjust (){
		if (widthOfList() + getLeftPosi() > + widthOfVisible()) {
			$scrollerRight.fadeIn('fast');
		} else {
			$scrollerRight.fadeOut('fast');
		}

		if (getLeftPosi()<0) {
			$scrollerLeft.fadeIn('fast');
		} else {
			$scrollerLeft.fadeOut('fast');
			$filesEl.animate({left: getLeftPosi() + "px"},'slow');
		}
	}

	$scrollerRight.click(function() {
		var delta = (getLeftPosi() - FILE_SCROLL_DELTA);
		$filesEl.animate({left: delta + "px"},'slow',function(){
			reAdjust();
		});
	});

	$scrollerLeft.click(function() {
		var delta = Math.min( (getLeftPosi() + FILE_SCROLL_DELTA), 0 );
		$filesEl.animate({left: delta + "px"},'slow',function(){
			reAdjust();
		});
	});

	updateFiles();

	// ----------------- version selector-------------

	// var soljsonSources is provided by bin/list.js

	$('option', '#versionSelector').remove();
	$.each(soljsonSources, function(i, file) {
		if (file) {
			var version = file.replace(/soljson-(.*).js/, "$1");
			$('#versionSelector').append(new Option(version, file));
		}
	});
	$('#versionSelector').change(function() {
		queryParams.update({version: $('#versionSelector').val() });
		loadVersion($('#versionSelector').val());
	});

	// ----------------- resizeable ui ---------------

	var EDITOR_SIZE_CACHE_KEY = "editor-size-cache";
	var dragging = false;
	$('#dragbar').mousedown(function(e){
		e.preventDefault();
		dragging = true;
		var main = $('#righthand-panel');
		var ghostbar = $('<div id="ghostbar">', {
			css: {
				top: main.offset().top,
				left: main.offset().left
			}
		}).prependTo('body');

		$(document).mousemove(function(e){
			ghostbar.css("left",e.pageX+2);
		});
	});

	var $body = $('body');

	function setEditorSize (delta) {
		$('#righthand-panel').css("width", delta);
		$('#editor').css("right", delta);
		onResize();
	}

	function getEditorSize(){
		window.localStorage[EDITOR_SIZE_CACHE_KEY] = $('#righthand-panel').width();
	}

	$(document).mouseup(function(e){
		if (dragging) {
			var delta = $body.width() - e.pageX+2;
			$('#ghostbar').remove();
			$(document).unbind('mousemove');
			dragging = false;
			setEditorSize(delta);
			window.localStorage.setItem(EDITOR_SIZE_CACHE_KEY, delta);
			reAdjust();
		}
	});

	// set cached defaults
	var cachedSize = window.localStorage.getItem(EDITOR_SIZE_CACHE_KEY);
	if (cachedSize) setEditorSize(cachedSize);
	else getEditorSize();


	// ----------------- toggle right hand panel -----------------

	var hidingRHP = false;
	$('.toggleRHP').click(function(){
		hidingRHP = !hidingRHP;
		setEditorSize( hidingRHP ? 0 : window.localStorage[EDITOR_SIZE_CACHE_KEY] );
		$('.toggleRHP i').toggleClass('fa-angle-double-right', !hidingRHP);
		$('.toggleRHP i').toggleClass('fa-angle-double-left', hidingRHP);
		if (!hidingRHP) compiler.compile();
	});

	function getHidingRHP() { return hidingRHP; }

	// ----------------- editor resize ---------------

	function onResize() {
		editor.resize();
		reAdjust();
	}
	window.onresize = onResize;
	onResize();

	document.querySelector('#editor').addEventListener('change', onResize);
	document.querySelector('#editorWrap').addEventListener('change', onResize);


	// ----------------- compiler output renderer ----------------------

	$('.asmOutput button').click(function() {$(this).parent().find('pre').toggle(); });


	// ----------------- compiler ----------------------

	function handleGithubCall(root, path, cb) {
		$('#output').append($('<div/>').append($('<pre/>').text("Loading github.com/" + root + "/" + path + " ...")));
		return $.getJSON('https://api.github.com/repos/' + root + '/contents/' + path, cb);
	}

	var compiler = new Compiler(web3, editor, handleGithubCall, $('#output'), getHidingRHP, updateFiles);

	function setVersionText(text) {
		$('#version').text(text);
	}

	var loadVersion = function(version) {
		setVersionText("(loading)");
		queryParams.update({version: version});
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if (document.location.protocol != 'file:' && Worker !== undefined && isFirefox) {
			// Workers cannot load js on "file:"-URLs and we get a
			// "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
			// resort to non-worker version in that case.
			compiler.initializeWorker(version, setVersionText);
		} else {
			Module = null;
			compiler.setCompileJSON()
			var newScript = document.createElement('script');
			newScript.type = 'text/javascript';
			newScript.src = 'https://ethereum.github.io/solc-bin/bin/' + version;
			document.getElementsByTagName("head")[0].appendChild(newScript);
			var check = window.setInterval(function() {
				if (!Module) return;
				window.clearInterval(check);
				compiler.onCompilerLoaded(setVersionText);
			}, 200);
		}
	};

	loadVersion( queryParams.get().version || 'soljson-latest.js');

	document.querySelector('#optimize').addEventListener('change', function(){
		queryParams.update({optimize: document.querySelector('#optimize').checked });
		compiler.compile();
	});

	storageHandler.sync();
};

module.exports = {
	'run': run
};
