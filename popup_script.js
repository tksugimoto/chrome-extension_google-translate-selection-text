
var textarea = document.getElementById("textarea");
textarea.focus();
document.execCommand("Paste", null, null);
// 文単位で改行する
var word = textarea.value.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");
chrome.extension.getBackgroundPage().openGoogleTranslatePage(word, {
    openSameWindow: true
});
close();