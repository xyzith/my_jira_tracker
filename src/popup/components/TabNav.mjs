import storage from '../storage/storage.mjs';

class TabNav extends HTMLElement {
	constructor() {
		super();
		storage.watch('tabs', this.renderTabs.bind(this));
		this.appendTab = this.appendTab.bind(this);
		this.init();
	}

	init() {
		const { tabs } = storage.getData();
		this.renderTabs(tabs);
	}

	flush() {
		while(this.firstChild) {
			this.firstChild.remove();
		}
	}

	appendTab(data) {
		const child = document.createElement('tab-label');
		child.applyData(data);
		this.appendChild(child);
	}

	renderTabs(tabs) {
		this.flush();
		if(tabs && tabs.length) {
			tabs.forEach(this.appendTab);
		}
	}
}


window.customElements.define('tab-nav', TabNav);

export default TabNav;
