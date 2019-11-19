// import { statusConfig } from '../config.mjs';
import TicketStatus from './TicketStatus.mjs';
import TicketRow from './TicketStatus.mjs';
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
		const { id } = props;
		const ticket = document.createElement('ticket-row');
		Object.assign(ticket, props)
		this.appendChild(ticket);
		return ticket.connected;
	}
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

	async update() {
		const jql = await this.getJql();
		const url = encodeURI(`https://jira.tc-gaming.co/jira/issues/?jql=${jql}`);
		await xhr(url).then((x) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(x.response, 'text/html')
			const data = this.parseTable(doc);
			const updatedList = this.updateTickets(data);
			this.saveTab(updatedList) 
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

	updateTickets(data) {
		const { ticketList } = storage.getData();
		data.forEach(({ id, summary, status, jql = '' }) => {
			const target = ticketList.find((ticket) => ticket.id === id);
			Object.assign(target, { summary, status, jql });
		});
		
		return ticketList;
	}
}


window.customElements.define('tab-content', TabContent);

export default TabContent;
