chrome.browserAction.onClicked.addListener(function (tab) {

    chrome.storage.sync.set({ 'chrome-app-sync' : true });


    chrome.tabs.create({ 'url': chrome.extension.getURL('index.html') }, function (tab) {
    // tab opened
    });

});
