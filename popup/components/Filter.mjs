import storage from '../storage/storage.mjs';
import { statusMap } from '../config.mjs';

class Filter extends HTMLElement {
	constructor() {
		super();
		this.initShadow();
		storage.watch('filter', this.renderDots.bind(this));
	}

	get content() {
		const { shadowRoot } = this;
		const content = shadowRoot.querySelector('.content');
		return content;
	}


	initShadow() {
		const tmpl = document.getElementById('ticket-filter');
		const shadowRoot = this.attachShadow({ mode: 'open'});
		shadowRoot.appendChild(tmpl.content.cloneNode(true));
	}

	renderDots() {
		const { content } = this;
		const groups = [...statusMap.values()].map(({ type }) => type);
		this.clearChild();
		groups.forEach(this.renderDot.bind(this));
	}

	clearChild() {
		const { content } = this;
		while(content.firstChild) {
			content.removeChild(content.firstChild);
		}
		
	}

	renderDot(type) {
		const { content } = this;
		const { filter } = storage.getData();
		const div = document.createElement('div');
		div.classList.add(type);
		if (filter.has(type)) {
			div.classList.add('actived');
		}
		content.appendChild(div);
		div.addEventListener('click', () => this.handleNodeClick(type));
	}

	handleNodeClick(type) {
		const filter = new Set(storage.getData('filter'));
		if (filter.has(type)) {
			filter.delete(type);
		} else {
			filter.add(type);
		}
		storage.setData({ filter });
	}
}


window.customElements.define('ticket-filter', Filter);
export default Filter;
