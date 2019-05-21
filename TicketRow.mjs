class TicketRow extends HTMLElement {
	constructor({ id, summary, status, title }) {
		super();
		this.initShadow();
		this.connected = new Promise((resolve) => {
			this.resolveConnectPromise = () => resolve();
		});
		this.id = id;
		this.summary = summary || title;
		this.status = status;
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

	set status(status) {
		this.connected.then(() => {
			const { shadowRoot } = this;
			const el = shadowRoot.querySelector('ticket-status');
			el.status = status || '';
		});
	}
	get status() {
		return this.connected.then(() => {
			const { shadowRoot } = this;
			const el = shadowRoot.querySelector('ticket-status');
			return el.status;
		});
	}

	initCloseBtn() {
		const { shadowRoot } = this;
	}

	async export() {
		await this.connected;
		const { id, summary } = this;
		const status = await this.status;
		return { id, status, summary };
	}
}

window.customElements.define('ticket-row', TicketRow);

export default TicketRow;
