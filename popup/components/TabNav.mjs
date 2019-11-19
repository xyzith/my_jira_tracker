import storage from '../storage/storage.mjs';

class TabNav extends HTMLElement {
	constructor() {
		super();
		storage.watch('tabs', this.renderTabs.bind(this))
//		storage.watch('tabs', this.setDefaultTab.bind(this))
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
/*
	async setDefaultTab(tabs) {
		const activeTabId = Number(await storage.load('activeTabId'));
		const activeTab = tabs.find(({ id }) => id === activeTabId)
		if (!activeTab && tabs.length) {
			const firstTabId = tabs[0].id;
			storage.save('activeTabId', firstTabId);
		}
	}
*/
}


window.customElements.define('tab-nav', TabNav);

export default TabNav;
