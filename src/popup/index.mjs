import storage from './storage/storage.mjs';
import './storage/mutations.mjs';
import './components/index.mjs';

function getCurrentChromeTab() {
	const queryInfo = {
		active: true,
		currentWindow: true
	};
	return new Promise((resolve) => {
		chrome.tabs.query(queryInfo, (tabs) => {
			resolve(tabs[0]);
		});
	});
}

async function init() {
	const page = await getCurrentChromeTab();
	const url = new URL(page.url);
	const { searchParams, host, search } = url;
	const filter = searchParams.get('filter');
	const jql = searchParams.get('jql');
	if (host === 'jira.tc-gaming.co') {
		const currentPage =  { filter, jql, search };
		storage.setData({ currentPage });
	}
}

init();



/*
document.querySelector('footer .btns .import span').addEventListener('click', (e) => {
	e.target.nextElementSibling.click();
});

document.querySelector('footer .btns .import input').addEventListener('change', (e) => {
	const file = e.target.files[0];
	const reader = new FileReader();
	reader.addEventListener('load', (e) => {
		const list = JSON.parse(reader.result);
		ticketList = ticketList.concat(list.map(t => new Tabs(t.name, t.tickets)));
		save();

	});
	reader.readAsText(file);
});
*/

/*

function sendMessage(tabId, data) {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tabId, data, r => resolve(r));
	});
}

// TODO new components
class LightBox {
	constructor() {
		this.el = this.render();
	}
	confirm(text) {
		document.body.appendChild(this.el);
		this.text.textContent = text;
		return new Promise((resolve, reject) => {
			this.ok.onclick = () => {
				this.remove();
				resolve();
			};
			this.cancel.onclick = () => {
				this.remove();
				reject();
			};
		});
	}
	remove() {
		this.el.remove();
	}
	render() {
		const lightbox = document.createElement('div');
		const content = document.createElement('div');
		const btns = document.createElement('div');
		this.text = document.createElement('div');
		this.ok = document.createElement('button');
		this.cancel = document.createElement('button');
		this.ok.textContent = 'OK';
		this.cancel.textContent = 'Cancel';
		btns.appendChild(this.ok);
		btns.appendChild(this.cancel);
		lightbox.className = 'lightbox';
		content.className = 'content';
		content.appendChild(this.text);
		content.appendChild(btns);
		lightbox.appendChild(content);
		return lightbox;
	}
}
const lightbox = new LightBox();

function init() {
	const getPageTab = getCurrentChromeTab();
	const syncStorage = storage.syncData();
	return Promise.all([getPageTab, syncStorage]).then(([pagetab, data]) => {
		console.log(pagetab, data);
	});
}
init();

function foo() {
	getCurrentChromeTab().then(function(pagetab){
		function initTicketList() {
			ticketList = [];
			ticketList.push(new Tabs('Tab 1'));
			return ticketList;
		}
		function addTicket() {
			Ticket.fromTab(pagetab).then(ticket => {
				currentTab.add(ticket);
			});
		}
		function renderAddBtn(tar, ticketId) {
			if(!currentTab.hasTicket(ticketId)) {
				const btn = document.createElement('button');
				btn.textContent = 'Add this jira ticket.';
				btn.addEventListener('click', addTicket);
				tar.appendChild(btn);
			} else {
				tickets.get(ticketId).updateFromTab(pagetab);
			}
		}
		function setupAddBtn() {
			const {url} = pagetab;
			const match = url.match(/browse\/(\w+-\d+)(:?\?|$)/);
			if(match) {
				const ticketId = match[1];
				sendMessage(pagetab.id, {action: 'IS_READY'}).then(r => {
					if(r) {
						renderAddBtn(document.querySelector('body > footer .btns'), ticketId);
					}
				});
			}
		}
		function bindEvents() {
			document.querySelector('main > nav .new_tab').addEventListener('click', (e) => {
				ticketList.push(new Tabs('New Tab'));
				save();
			});
			document.querySelector('footer .btns .import span').addEventListener('click', (e) => {
				e.target.nextElementSibling.click();
			});
			document.querySelector('footer .btns .import input').addEventListener('change', (e) => {
				const file = e.target.files[0];
				const reader = new FileReader();
				reader.addEventListener('load', (e) => {
					const list = JSON.parse(reader.result);
					ticketList = ticketList.concat(list.map(t => new Tabs(t.name, t.tickets)));
					save();

				});
				reader.readAsText(file);
			});
		}

	storage.load('tabs').then(({ tabs }) => {

		let foo;
		if(tabs && tabs.length) {

//			ticketList = list.data.map(t => new Tabs(t.name, t.tickets));
			foo = tabs.map(t => new TabLabel(t));
		} else {
//			ticketList = initTicketList();
		}

		const nav = document.querySelector('nav');
		foo.forEach((bar) => {
			nav.appendChild(bar);
		});
		load('lastActiveTab').then((data) => {
			const last = ticketList.filter((t) => t.name === data.lastActiveTab);
			selectTab(last[0] || ticketList[0]);
		});
		bindEvents();
		setupAddBtn();
	});
	});
}
*/
