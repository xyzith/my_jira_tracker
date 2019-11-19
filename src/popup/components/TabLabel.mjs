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
		shadowRoot.querySelector('.tab-label').addEventListener('click', this.selectTab.bind(this));
		shadowRoot.querySelector('.counter').addEventListener('click', this.remove.bind(this));
	}

	setTabStat() {
		const { activeTabId } = storage.getData();
		const { tabId } = this;
		if (activeTabId === tabId) {
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
	dropTab(e) {
		e.stopPropagation();
		// TODO remove
	}

	selectTab() {
		const { tabId } = this;
		storage.save('activeTabId', tabId);
	}
}

window.customElements.define('tab-label', TabLabel);

export default TabLabel;
