
const ID_TRANSLATE_BY_GOOGLE = "translate-by-google";

const createContextMenu = () => {
	chrome.contextMenus.create({
		title: "選択文字をgoogle翻訳",
		contexts: ["selection"],
		id: ID_TRANSLATE_BY_GOOGLE
	});
};

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === ID_TRANSLATE_BY_GOOGLE) {
		const selectionText = info.selectionText;
		openGoogleTranslatePage(selectionText, {
			currentTab: tab
		});
	}
});

const getClipboardText = () => {
	const textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.focus();
	document.execCommand("Paste", null, null);

	const clipboardText = textarea.value;

	document.body.removeChild(textarea);

	return clipboardText;
};

chrome.browserAction.onClicked.addListener(tab => {
	const clipboardText = getClipboardText();

	openGoogleTranslatePage(clipboardText, {
		openSameWindow: true
	});
});

const openGoogleTranslatePage = (text, {
	openSameWindow, currentTab
} = {}) => {
	// 文単位で改行する
	text = text.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");

	const url = generateGoogleTranslatePageUrl(text);

	chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, currentWindowInfo => {
		if (!openSameWindow && currentWindowInfo.state === "normal") {
			const currentLeft = currentWindowInfo.left;
			const currentWidth = currentWindowInfo.width;
			const currentHeight = currentWindowInfo.height;
			chrome.windows.create({
				url: url,
				top: 0,
				height: currentHeight,
				left: currentLeft === 0 ? currentWidth : 0,
				width: currentWidth
			});
		} else {
			const createProperties = {
				url: url
			};
			if (currentTab && currentTab.id !== chrome.tabs.TAB_ID_NONE) {
				createProperties.openerTabId = currentTab.id;
			}
			chrome.tabs.create(createProperties);
		}
	});
};

const generateGoogleTranslatePageUrl = text => {
	const queryObject = {
		hl: "ja",
		q: text
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join("&");
	const url = `https://translate.google.co.jp/?${queryString}`;

	return url;
};
