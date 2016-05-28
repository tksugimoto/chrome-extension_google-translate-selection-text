
var ID_TRANSLATE_BY_GOOGLE = "translate-by-google";

function createContextMenus() {
    chrome.contextMenus.create({
        title: "選択文字をgoogle翻訳",
        contexts: ["selection"],
        id: ID_TRANSLATE_BY_GOOGLE
    });
}

chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup.addListener(createContextMenus);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === ID_TRANSLATE_BY_GOOGLE) {
        // 文単位で改行する
        var word = info.selectionText.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");
        openGoogleTranslatePage(word, {
            tab: tab
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
	var textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.focus();
	document.execCommand("Paste", null, null);

	// 文単位で改行する
	var word = textarea.value.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");

	openGoogleTranslatePage(word, {
		openSameWindow: true
	});
	
	document.body.removeChild(textarea);
});

function openGoogleTranslatePage(word, options){
    if (!options) options = {};
    var openSameWindow = options.openSameWindow;
    var url = "https://translate.google.co.jp/?hl=ja&q=" + encodeURIComponent(word);
    chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, function(currentWindowInfo) {
        if (!openSameWindow && currentWindowInfo.state === "normal") {
            var currentLeft = currentWindowInfo.left;
            var currentWidth = currentWindowInfo.width;
            var currentHeight = currentWindowInfo.height;
            chrome.windows.create({
                url: url,
                top: 0,
                height: currentHeight,
                left: currentLeft === 0 ? currentWidth : 0,
                width: currentWidth
            });
        } else {
            var createProperties = {
                url: url
            };
            if (options.tab) {
                createProperties.openerTabId = options.tab.id;
            }
            chrome.tabs.create(createProperties);
        }
    });
}