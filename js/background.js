

function initPopupPage(url = 'popup.html', callback) {
	var w = 800;
	var h = 550;
	var left = Math.round((screen.width / 2) - (w / 2));
	var top = Math.round((screen.height / 2) - (h / 2));

	chrome.windows.create({
		url: url,
		width: w,
		height: h,
		focused: true,
		'left': left,
		'top': top,
		type: 'popup'
	}, callback);
}

chrome.contextMenus.create({
	title: '上传图片',
	id: 'uploadPic',
	contexts: ['image']
});

var oldId = null;

chrome.contextMenus.onClicked.addListener(function (itemData) {
	if (itemData.menuItemId === "uploadPic") {
		var imageURL = itemData.srcUrl;

		if (document.querySelector) {
			if (oldId) {
				chrome.windows.remove(oldId);
				oldId = null;
			}
			initPopupPage(undefined, (win) => {
				oldId = win.id;
				const tabId = win.tabs[0].id;
				chrome.tabs.onUpdated.addListener(function (id, info) {
					if (info.status === 'complete' && id === tabId) {
						chrome.tabs.sendMessage(tabId, { message: 'uploadImageDataByURL', url: imageURL });
					}
				});
			});
		}
	}
});

chrome.browserAction.onClicked.addListener(function (tab) {
	var w = 800;
	var h = 550;
	var left = Math.round((screen.width / 2) - (w / 2));
	var top = Math.round((screen.height / 2) - (h / 2));
	if (oldId) {
		chrome.windows.remove(oldId);
		oldId = null;
	}
	chrome.windows.create({
		url: 'popup.html',
		width: w,
		height: h,
		focused: true,
		'left': left,
		'top': top,
		type: 'popup'
	}, function(win){
		oldId = win.id;
	});
});

function showMessage(title, content) {
	var n = new Notification(title, {
		lang: "utf-8",
		icon: "icon_38.png",
		body: content
	});
}