export function xhr(url) {
	return new Promise((resolve) => {
		const x = new XMLHttpRequest();
		x.open('GET', url);
		x.onload = () => resolve(x);
		x.send();
	});
}

/*
export function loadKey(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key , value => resolve(value));
	});
}

export async function saveTab(tabIndex, tabData = {}) {
	const { tabs } = await loadKey('tabs');

	return await new Promise((resolve) => {
		chrome.storage.local.set({ tabs }, resolve);
	});
}

export async function loadTab(id) {
	const { tabs } = await loadKey('tabs');
	return tabs.find((tab) => tab.id = id);
}
*/

export function sleep(ms) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

//saveTab();
/*
loadTab(15335).then((data) => {
	console.log('asd', data);
});
*/
