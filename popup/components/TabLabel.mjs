class TabLabel extends HTMLElement {
	constructor(name, tickets) {
		super();
		this.name = name;
	}

	get isActive() {
		return currentTab === this;
	}
	destroy() {
		// FIXME
		lightbox.confirm(`Remove ${this.name} ?`).then((ok) => {
			const idx = ticketList.indexOf(this);
			ticketList.splice(idx, 1);
			this.el.remove();
			save()
			if(currentTab === this) {
				selectTab(ticketList[0]);
			}
		}, () => null);
	}
	updateActiveState() {
		this.el.classList.toggle('active', this.isActive)
	}
	// FIXME typo
	updateCouter() {
		if(this.el) {
			const counter = this.el.querySelector('.counter');
			const count = Array.from(this.tickets.values()).filter((t) => filter.isShow(t.status)).length;
			counter.textContent = count > 99 ? '\u221E' : count;
		}
	}
	updateName(name) {
		this.name = name;
	//	save();
	}

	render() {
		const dom = document.querySelector('main > nav');
		const container = document.createElement('div');
		const name = document.createElement('input');
		const counter = document.createElement('div');
		const saveAndUpdate = (e) => {
			name.size = countSize()
			this.name = e.target.value;
			e.target.disabled = true;
			save();
		}
		const countSize = () => Math.max(this.name.length - 3, 1);
		container.className = 'tab';
		counter.className = 'counter';
		name.className = 'name';
		name.disabled = true;
		name.size = countSize();
		name.value = this.name;
		container.appendChild(name);
		container.appendChild(counter);
		name.addEventListener('input', (e) => (name.size = countSize()));
		name.addEventListener('change', saveAndUpdate);
		name.addEventListener('blur', saveAndUpdate);

		counter.addEventListener('click', this.destroy.bind(this));
		container.addEventListener('dblclick', (e) => {
			name.disabled = false;
			name.focus();
		});
		container.addEventListener('click', (e) => {
			if(e.target != counter) {
				selectTab(this);
			}
		});
		this.el = container;
//		this.updateCouter();
		dom.appendChild(container);
	}
}

window.customElements.define('tab-labrel', TabLabel);

export default TabLabel;
