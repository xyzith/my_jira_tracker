import { statusConfig } from '../config.mjs';

class TicketStatus extends HTMLElement {
	static createCssRule(classes, color) {
		const classString = classes.map((className) => `.${className}`).join(', ');
		const colorString =  `background-color: ${color};`;
		return `${classString} { ${colorString} }`
	}
	static formatClassName(name) {
		return name.replace(/ /g, '-').toLowerCase();
	}

	constructor() {
		super();
		this.initShadow();
	}

	initShadow() {
		const tmpl = document.getElementById('ticket-status');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
		this.applyCss();
	}


	set status(sta) {
		const { shadowRoot } = this;
		this.textContent = sta
		this.setAttribute('status', sta);

		const div = shadowRoot.querySelector('div');
		div.className = TicketStatus.formatClassName(sta);
	}

	get status() {
		return this.getAttribute('status');
	}

	createStyleSheet() {
		const { shadowRoot } = this;
		const styleEl = document.createElement('style');
		shadowRoot.appendChild(styleEl);
		return styleEl;
	}


	applyCss() {
		const style = this.createStyleSheet();
		const config = Object.values(statusConfig);
		config.forEach(({ group, color }) => {
			const rule = TicketStatus.createCssRule(group, color)
			style.innerHTML += rule;
//			XXX  CSSStyleSheet will be flushed once the element unmount. Browser bugs ?
//			style.sheet.insertRule(rule);
		});
	}
}

customElements.define('ticket-status', TicketStatus);

export default TicketStatus;
