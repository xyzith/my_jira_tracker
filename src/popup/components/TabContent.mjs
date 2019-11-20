// import { statusConfig } from '../config.mjs';
import { xhr } from '../utils.mjs';
import storage from '../storage/storage.mjs';

class TabContent extends HTMLElement {
	constructor() {
		super();
		storage.watch('tabs', this.renderTickets.bind(this));
		storage.watch('activeTabId', async () => {
			await this.renderTickets();
			this.update();
		});
	}

	get activedTab() {
		const { tabs, activeTabId } = storage.getData();
		return tabs.find((({ id }) => id === activeTabId ));
	}

	saveTab(list) {
		const { activedTab } = this;
		const { tabs } = storage.getData();
		activedTab.tickets = list;
		storage.save('tabs', tabs);
	}

	flush() {
		while(this.firstChild) {
			this.firstChild.remove();
		}
	}

	renderTickets() {
		const { ticketList } = storage.getData();
		this.flush();
		const renderList = ticketList.map((ticket) => this.appendTicket(ticket));
		return Promise.all(renderList);
	}

	appendTicket(props) {
		const ticket = document.createElement('ticket-row');
		Object.assign(ticket, props);
		this.appendChild(ticket);
		return ticket.connected;
	}
	/*
	async getJql() {
		const { activedTab } = this;
		const { jql } = activedTab;
		if (jql) { return jql; }
		return await this.buildJQLString();
	}

	async buildJQLString() {
		const { children } = this;
		const filterList = Array.prototype.filter.call(children, ({ statusType }) => statusType !== 'closed');
		const query = filterList.map(({ id }) => id).join(',');

		return `Key in(${query})`;
	}
	*/

	async update() {
		const { search } = this.activedTab || {};
		if (!search) { return; }

		const url = encodeURI(`https://jira.tc-gaming.co/jira/issues/${search}`);
		await xhr(url).then((x) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(x.response, 'text/html');
			const data = this.parseTable(doc);
			this.saveTab(data);
		});
	}

	parseTable(doc) {
		const rows = doc.querySelectorAll('#issuetable .issuerow');
		if (!rows.length) {
			throw new Error('Error on status update');
		}
		return Array.prototype.map.call(rows, (row) => {
			const id = row.querySelector('.issuekey').textContent.trim();
			const summary = row.querySelector('.summary').textContent.trim();
			const status = row.querySelector('.status').textContent.trim();
			return { id, summary, status };
		});
	}

	get(id) {
		const { children } = this;
		return Array.prototype.find.call(children, (ticket) => {
			return ticket.id === id;
		});
	}
}


window.customElements.define('tab-content', TabContent);

export default TabContent;
