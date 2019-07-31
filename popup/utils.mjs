export function xhr(url) {
	return new Promise((resolve, reject) => {
		const x = new XMLHttpRequest();
		x.open('GET', url);
		x.onload = () => resolve(x);
		x.send();
	});
}
/*
function save() {
	const data = ticketList.map(t => t.export());
	document.querySelector('footer .btns .export').href = `data:text/plain;charset=UTF-8,${JSON.stringify(data)}`;
	chrome.storage.local.set({ data, lastActiveTab: currentTab.name }, () => resolve());
}

function load(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key , value => resolve(value));
	});
}
*/
