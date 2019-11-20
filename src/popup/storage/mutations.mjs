import storage from './storage.mjs';
storage.watch('tabs', updateTicketList);
storage.watch('activeTabId', updateTicketList);

function updateTicketList() {
	const { tabs, activeTabId } = storage.getData();
	if (tabs.length) {
		const { tickets = [] } = tabs.find(({ id }) => id === activeTabId) || {};
		storage.setData({ ticketList: tickets.slice() });
	}
}

storage.watch('tabs', activeTabIdFallback);

function activeTabIdFallback() {
	const { tabs, activeTabId } = storage.getData();
	const currentTab = tabs.find(({ id }) => id === activeTabId);
	if (!currentTab) {
		storage.save('activeTabId', tabs[0].id);
	}
}
