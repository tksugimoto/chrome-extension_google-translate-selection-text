
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
		const word = info.selectionText;
		openGoogleTranslatePage(word, {
			tab: tab
		});
	}
});

const getClipboardText = () => {
	const textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.focus();
	document.execCommand("Paste", null, null);

	const word = textarea.value;

	document.body.removeChild(textarea);

	return word;
};

chrome.browserAction.onClicked.addListener(tab => {
	const word = getClipboardText();

	openGoogleTranslatePage(word, {
		openSameWindow: true
	});
});

const openGoogleTranslatePage = (word, {
	openSameWindow, tab
} = {}) => {
	// 文単位で改行する
	word = word.replace(/([.]"?) +(?=[A-Z])/g, "$1\n\n");

	const url = generateGoogleTranslatePageUrl(word);

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
			if (tab && tab.id !== chrome.tabs.TAB_ID_NONE) {
				createProperties.openerTabId = tab.id;
			}
			chrome.tabs.create(createProperties);
		}
	});
};

const generateGoogleTranslatePageUrl = translateText => {
	const queryObject = {
		hl: "ja",
		q: translateText
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join("&");
	const url = `https://translate.google.co.jp/?${queryString}`;

	return url;
};
