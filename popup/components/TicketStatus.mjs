import { statusMap } from '../config.mjs';

class TicketStatus extends HTMLElement {
	constructor() {
		super();
		this.initShadow();
	}

	initShadow() {
		const tmpl = document.getElementById('ticket-status');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
	}

	set status(sta) {
		console.log(sta);
		const { shadowRoot } = this;
		this.textContent = sta
		this.setAttribute('status', sta);

		const div = shadowRoot.querySelector('div');
		div.className = this.statusGroup;
	}

	get status() {
		return this.getAttribute('status');
	}

	get statusGroup() {
		const { status } = this;
		console.log(...statusMap.keys(), status);
		const targetGroup = [...statusMap.keys()].find((group) => group.indexOf(status) !== -1);
		const { type } = statusMap.get(targetGroup);
		return type;

	}

	createStyleSheet() {
		const { shadowRoot } = this;
		const styleEl = document.createElement('style');
		shadowRoot.appendChild(styleEl);
		return styleEl;
	}
}

customElements.define('ticket-status', TicketStatus);

export default TicketStatus;
