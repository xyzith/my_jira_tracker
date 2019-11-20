import storage from '../storage/storage.mjs';

class AddButton extends HTMLElement {
	constructor() {
		super();
		storage.watch('currentPage', this.updateButton.bind(this));
		this.initShadow();
	}

	initShadow() {
		const tmpl = document.getElementById('add-button');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
		const button = shadowRoot.querySelector('button');
		button.addEventListener('click', this.addFilter.bind(this));

	}


	updateButton(page = {}) {
		const { filter, jql, search } = page;
		this.search = search;
		if (filter || jql) {
			this.show();
		}
	}

	show() {
		this.classList.remove('hide');
	}

	addFilter() {
		const { currentPage } = storage.getData();
		const tabs = storage.getData('tabs').slice();
		const search = window.decodeURIComponent(currentPage.search);
		const id = this.generateTabID();
		tabs.push({ id, search, name: 'new', tickets: [] });
		storage.save('tabs', tabs).then(() => {
			storage.save('activeTabId', id);
		});
	}

	generateTabID() {
		const { tabs } = storage.getData();
		const ids = tabs.map(({ id }) => id);
		const newId = Math.floor(Math.random() * 100000);
		if(ids.indexOf(newId) === -1) {
			return newId;
		}
		return this.generateTabID(tabs);
	}
}


window.customElements.define('add-button', AddButton);
export default AddButton;
