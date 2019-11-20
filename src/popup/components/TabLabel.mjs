import storage from '../storage/storage.mjs';

class TabLabel extends HTMLElement {
	constructor() {
		super();
		this.initShadow();
		this.connected = new Promise((resolve) => {
			this.resolveConnectPromise = () => resolve();
		});
	}

	initShadow() {
		const tmpl = document.getElementById('tab-label');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
		shadowRoot.querySelector('.tab-label').addEventListener('click', this.handleClickTab.bind(this));
		shadowRoot.querySelector('.counter').addEventListener('click', this.dropTab.bind(this));
		shadowRoot.querySelector('input').addEventListener('blur', this.saveName.bind(this));
	}

	setTabStat() {
		const { actived } = this;
		if (actived) {
			this.active();
		} else {
			this.inactive();
		}
	}

	active() {
		const { shadowRoot } = this;
		shadowRoot.querySelector('.tab-label').classList.add('active');
	}

	inactive() {
		const { shadowRoot } = this;
		shadowRoot.querySelector('.tab-label').classList.remove('active');
	}

	applyData({ name, tickets = [], id }) {
		this.name = name;
		this.tabId = id;
		this.size = tickets.length;
		this.setTabStat();
	}

	set name(name) {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('.name');
		el.value = name;
	}

	get name() {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('.name');
		return el.value;
	}

	set size(size) {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('.counter');
		el.textContent = size;
	}

	get actived() {
		const { activeTabId } = storage.getData();
		const { tabId } = this;
		return activeTabId === tabId;
	}

	get inputEl() {
		const { shadowRoot } = this;
		return shadowRoot.querySelector('input');
	}

	dropTab(e) {
		e.stopPropagation();
		const { tabId } = this;
		const { tabs } = storage.getData();
		const updatedTabs = tabs.filter(({ id }) => id !== tabId);
		storage.save('tabs', updatedTabs);
		// TODO confirm
	}

	handleClickTab() {
		const { actived } = this;
		if (actived) {
			this.enableInput();
		} else {
			const { tabId } = this;
			storage.save('activeTabId', tabId);
		}
	}

	enableInput() {
		const { inputEl } = this;
		inputEl.disabled = false;
	}

	saveName() {
		const { inputEl, tabId } = this;
		const { value } = inputEl;
		const { tabs } = storage.getData();
		const traget = tabs.find(({ id }) => tabId === id);
		traget.name = value;
		storage.save('tabs', tabs);
		inputEl.disabled = true;
	}

	selectTab() {
		const { tabId } = this;
		storage.save('activeTabId', tabId);
	}
}

window.customElements.define('tab-label', TabLabel);
export default TabLabel;
