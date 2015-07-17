chrome.contextMenus.create({
    title: "選択文字をgoogle翻訳",
    contexts: ["selection"],
    onclick: function(info, tab) {
        // 文単位で改行する
        var word = info.selectionText.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");
        openGoogleTranslatePage(word, {
            tab: tab
        });
    }
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
                // 新しいタブは親ページのひとつ右で開く
                createProperties.index = options.tab.index + 1;
            }
            chrome.tabs.create(createProperties);
        }
    });
}