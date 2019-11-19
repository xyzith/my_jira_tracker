import storage from './storage.mjs';
storage.watch('tabs', updateTicketList);
storage.watch('activeTabId', updateTicketList);

function updateTicketList() {
	const { tabs, activeTabId } = storage.getData();
	if (tabs.length) {
		const { tickets = [] } = tabs.find(({ id }) => id === activeTabId) || tabs[0];
		storage.setData({ ticketList: tickets.slice() });
	}
}
