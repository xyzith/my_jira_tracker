import { statusConfig } from '../config.mjs';
import TicketStatus from './TicketStatus.mjs';
import { xhr } from '../utils.mjs';

class TabContent extends HTMLElement {
	flush() {
		while(this.firstChild) {
			this.firstChild.remove();
		}
	}

	appendTicket(props) {
		const { id } = props;
		const ticket = document.createElement('ticket-row');
		Object.assign(ticket, props)
		this.appendChild(ticket);
	}
	// TODO move update method to other place

	buildJQLString() {
		const getData = Array.prototype.map.call(this.children, (ticket) => ticket.export());
		return Promise.all(getData).then((data) => {
			const jql = data.filter(({ status }) => statusConfig.closed.group.indexOf(TicketStatus.formatClassName(status)) === -1)
				.map(({ id }) => id).join(',');
			return `Key in(${jql})`;
		});
	}

	async update() {
		const jql = await this.buildJQLString();
		const url = encodeURI(`https://jira.tc-gaming.co/jira/issues/?jql=${jql}`);
		await xhr(url).then((x) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(x.response, 'text/html')
			this.parseTable(doc);
		});
	}

	parseTable(doc) {
		const rows = doc.querySelectorAll('#issuetable .issuerow');
		if (!rows.length) {
			console.error('Error on status update');
		} else {
			Array.prototype.map.call(rows, (row) => {
				const id = row.querySelector('.issuekey').textContent.trim();
				const summary = row.querySelector('.summary').textContent.trim();
				const status = row.querySelector('.status').textContent.trim();
				return { id, summary, status };
				
			}).forEach(this.updateTicket.bind(this));
		}
	}

	get(id) {
		const { children } = this;
		return Array.prototype.find.call(children, (ticket) => {
			return ticket.id === id;
		});
	}

	export() {
		const requestData = Array.prototype.map.call(this.children, (ticket) => ticket.export());
		return Promise.all(requestData);
	}

	updateTicket({ id, summary, status }) {
		const ticket = this.get(id);
		if (!ticket) {
			this.appendTicket({ id, summary, status });
		} else {
			ticket.status = status;
			ticket.summary = summary;
		}
	}
}


window.customElements.define('tab-content', TabContent);

export default TabContent;
