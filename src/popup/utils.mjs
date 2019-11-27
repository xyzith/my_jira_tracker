export function xhr(url) {
	return new Promise((resolve) => {
		const x = new XMLHttpRequest();
		x.open('GET', url);
		x.onload = () => resolve(x);
		x.send();
	});
}

export function sleep(ms) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}
