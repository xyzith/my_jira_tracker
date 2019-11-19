import storage from '../storage/storage.mjs';
import { statusMap } from '../config.mjs';
import TicketStatus from './TicketStatus.mjs';

class TicketRow extends HTMLElement {
	constructor() {
		super();
		this.initShadow();
		this.connected = new Promise((resolve) => {
			this.resolveConnectPromise = () => resolve();
		});
	}

	connectedCallback() {
		this.resolveConnectPromise();
	}

	initShadow() {
		const tmpl = document.getElementById('ticket-row');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
		this.initCloseBtn();
	}
	set id(id) {
		const { shadowRoot } = this;
		const link = shadowRoot.querySelector('.id')
		link.textContent = id;
		link.href = `https://jira.tc-gaming.co/jira/browse/${id}`;
	}

	get id() {
		const { shadowRoot } = this;
		const id = shadowRoot.querySelector('.id')
		return (id.textContent);
	}

	set summary(summary) {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('.summary');
		el.textContent = summary;
		el.title = summary;
	}
	get summary() {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('.summary');
		return el.textContent;
	}

	get statusGroup() {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('ticket-status');
		return el.statusGroup;
	}

	get status() {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('ticket-status');
		return el.status;
	}

	set status(status) {
		this.connected.then(() => {
			const { shadowRoot } = this;
			const el = shadowRoot.querySelector('ticket-status');
			el.status = status || '';
			this.setVisibility();
			storage.watch('filter', this.setVisibility.bind(this));
		});
	}
	
	setVisibility() {
		const { filter } = storage.getData();

		if (filter.has(this.statusGroup)) {
			this.show();
		} else {
			this.hide();
		}
	}

	getStatus() {
		const { shadowRoot } = this;
		const el = shadowRoot.querySelector('ticket-status');
		return el.status;
	}

	initCloseBtn() {
		const { shadowRoot } = this;
	}

	hide() {
		this.classList.add('hide');
	}

	show() {
		this.classList.remove('hide');
	}
}

window.customElements.define('ticket-row', TicketRow);

export default TicketRow;
