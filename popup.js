function getCurrentChromeTab() {
	const queryInfo = {
		active: true,
		currentWindow: true
	};
	return new Promise((resolve, reject) => {
		chrome.tabs.query(queryInfo, tabs => {
			resolve(tabs[0]);
		});
	});
}
function xhr(url) {
	return new Promise((resolve, reject) => {
		const x = new XMLHttpRequest();
		x.open('GET', url);
		x.onload = () => resolve(x);
		x.send();
	});
}
function sendMessage(tabId, data) {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tabId, data, r => resolve(r));
	});
}
function save() {
	const data = ticketList.map(t => t.export());
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({data}, () => resolve());
	});
}
function load() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('data' , value => resolve(value));
	});
}
function observe(prop, action) {
	if(typeof this[prop] === 'function') {
		let func = this[prop];
		this[prop] = new Proxy(func, {
			apply: (orig, thisArg, args) => {
				var res = orig.apply(this, args);
				action(args);
				return res;
			}
		});
	} else {
		let v = this[prop];
		Object.defineProperty(this, prop, {
			set: (new_value) => {
				if(v !== new_value) {
					v = new_value;
					action(new_value);
				}
			},
			get: () => v
		});
	}
}
function observeAll(action) {
	const proxy = new Proxy(this, {
		set: function(obj, key, new_val) {
			if(obj[key] !== new_val) {
				obj[key] = new_val;
				action(obj);
			}
			return true;
		}
	});
	return proxy;
}
function selectTab(tab) {
	currentTab = tab;
	ticketList.forEach((t) => t.updateTabStatus());
	currentTab.renderTicketsList();
	currentTab.updateTickets();
}
class Filter {
	constructor(config) {
		this.config = config;
		this.applyCss();
		this.render();
	}
	isShow(sta) {
		const show = Object.values(this.config).filter(v => v.show).reduce((list, cfg) => list.concat(cfg.group), []);
		return show.indexOf(sta) >= 0;
	}
	applyCss() {
		const cfg = this.config;
		const el = document.createElement('style');
		for(let k in cfg) {
			let sta = cfg[k];
			let str = '';
			sta.group.forEach((v) => {
				str += `.${v},`;
			});
			str = str.replace(/,$/, '');
			str += (`{ background-color:${sta.color}; border-color:${sta.color}; }\n`);
			el.innerHTML += str;
		}
		document.head.appendChild(el);
	}
	render() {
		const tar = document.querySelector('body > footer nav');
		const render = (k) => {
			const btn = document.createElement('button');
			const clickHandler = (e) => {
				var foo = this.config[k].show;
				this.config[k].show = !foo;
			}
			const handler = (bool) => {
				if(bool) {
					btn.classList.remove('inactive');
				} else {
					btn.classList.add('inactive');
				}
				currentTab.renderTicketsList();
			}
			btn.addEventListener('click', (e) => this.config[k].show = !this.config[k].show);
			observe.call(this.config[k], 'show', handler);
			btn.classList.add(k);
			if(!this.config[k].show) {
				btn.classList.add('inactive');
			}
			tar.appendChild(btn);
		}
		Object.keys(this.config).forEach(render);
	}
}
class Tabs {
	constructor(name, tickets) {
		this.name = name;
		this.tickets = this.createListFromArray(tickets);
		observe.call(this, 'add', save);
		observe.call(this, 'remove', save);
		this.render();
	}
	get isActive() {
		return currentTab === this;
	}
	createListFromArray(tickets) {
		if(tickets) {
			return new Map(tickets.map(t => [t.id, new Ticket(t)]));
		}
		return new Map();
	}
	add(ticket) {
		this.tickets.set(ticket.sta.id, ticket);
		this.renderTicketsList();
	}
	remove(ticket) {
		this.tickets.delete(ticket.sta.id);
		this.renderTicketsList();
	}
	export() {
		const tickets = Array.from(this.tickets.values()).map((t) => {
			return t.export()
		});
		const {name} = this;
		return {name, tickets};
	}
	buildJQLString() {
		let str = Array.from(this.tickets.values()).reduce((jql, ticket) => {
			if(!(filter.config.closed.group.indexOf(ticket.status) >= 0)) {
				return `${jql}${ticket.sta.id},`;
			}
			return jql;
		}, '');
		str = `Key in(${str.replace(/,$/, '')})`;
		return str;
	}
	updateTickets() {
		const url = encodeURI(`https://jira.tc-gaming.co/jira/issues/?jql=${this.buildJQLString()}`);
		xhr(url).then((x) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(x.response, 'text/html')
			this.parseTable(doc);
		});
	}
	parseTable(doc) {
		const rows = doc.querySelectorAll('#issuetable .issuerow');
		rows.forEach(this.updateTicket.bind(this));
		save();
	}
	updateTicket(row) {
		const id = row.querySelector('.issuekey').textContent.trim();
		const summary = row.querySelector('.summary').textContent.trim();
		const status = row.querySelector('.status').textContent.trim();
		const ticket = this.tickets.get(id);
		ticket.sta.status = status;
		ticket.sta.summary = summary;
	}
	renderTicketsList() {
		const el = document.querySelector('.jira .list');
		while(el.firstChild) {
			el.firstChild.remove();
		}
		this.tickets.forEach( ticket => {
			el.appendChild(ticket.render());
		});
	}
	updateName(name) {
		this.name = name;
		save();
	}
	destroy() {
		if(confirm(`Remove ${this.name} ?`)) {
			const idx = ticketList.indexOf(this);
			ticketList.splice(idx, 1);
			this.el.remove();
			save()
			selectTab(ticketList[0]);
		}
	}
	updateTabStatus() {
		this.el.classList.toggle('active', this.isActive)
	}
	render() {
		const dom = document.querySelector('main > nav');
		const container = document.createElement('div');
		const name = document.createElement('input');
		const counter = document.createElement('div');
		const count = Array.from(this.tickets.values()).filter((t) => filter.isShow(t.status)).length;
		const saveAndUpdate = (e) => {
			name.size = countSize()
			this.name = e.target.value;
			e.target.disabled = true;
			save();
		}
		const countSize = () => Math.max(this.name.length - 3, 1);
		container.className = 'tab';
		counter.className = 'counter';
		counter.textContent = count > 99 ? '\u221E' : count;
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
		container.addEventListener('dblclick', (e) => (name.disabled = false));
		container.addEventListener('click', (e) => {
			if(e.target != counter) {
				selectTab(this);
			}
		});
		this.el = container;
		dom.appendChild(container);
	}
}

class Ticket {
	constructor(data) {
		data = data || {}
		const sta = Object.assign({}, data);

		this.sta = observeAll.call(sta, () => {
			const old = this.el;
			this.render();
			if(old && old.parentNode) {
				old.parentNode.replaceChild(this.el, old);
			}
		});
	}
	get status() {
		return this.sta.status.replace(/ /g, '').toLowerCase();
	}
	export() {
		const {id} = this.sta;
		const {url} = this.sta;
		const {status} = this.sta;
		const {title} = this.sta;
		const {desc} = this.sta;

		return {id, url, status, title, desc};
	}

	renderStatus() {
		const status_el = document.createElement('div');
		const wrapper = document.createElement('div');
		status_el.className = 'status ' + this.status;
		status_el.textContent = this.sta.status;
		wrapper.appendChild(status_el);
		return wrapper;
	}

	render() {
		const item = document.createElement('div');
		const del = document.createElement('span');
		const copy = document.createElement('span');
		const id = document.createElement('a');
		const desc = document.createElement('p');
		const title = document.createElement('summary');
		const details = document.createElement('details');
		id.className = 'id';
		id.textContent = this.sta.id;
		id.href = this.sta.url;
		id.target = '_blank';
		id.title = 'Go to ticket';
		del.textContent = '\u2716'
		del.className = 'close'
		del.title = 'Remove this ticket'
		copy.innerHTML = '&#128194';
		copy.textContent = '\uD83D\uDCCB';
		copy.className = 'copy'
		copy.title = 'Copy to clipboard'
		desc.className = 'desc';
		desc.textContent = this.sta.desc;
		title.className = 'title';
		title.textContent = this.sta.title.replace(/^.*\]/, '').replace(/ - TC Gaming JIRA$/, '');
		title.title = title.textContent;
		details.appendChild(title);
		details.appendChild(desc);
		item.appendChild(id);
		item.appendChild(del);
		item.appendChild(copy);
		item.appendChild(details);
		item.appendChild(this.renderStatus());
		item.classList.add('ticket');
		if(!filter.isShow(this.status)) {
			item.classList.add('hide');
		}
		del.addEventListener('click', () => {
			if(confirm(`Remove ${this.sta.id} ?`)) {
				currentTab.remove(this);
			}
		});
		copy.addEventListener('click', () => {
			const range = document.createRange();
			const selection = window.getSelection();
			const tmp = document.createElement('span');
			tmp.textContent = id.textContent;
			tmp.style.position = 'absolute';
			tmp.style.opacirt = '0';

			document.body.appendChild(tmp);
			range.selectNode(tmp);
			selection.removeAllRanges();
			selection.addRange(range);
			document.execCommand('copy');
			tmp.remove();
			selection.removeAllRanges();
		});
		this.el = item;
		return item;
	}
}

Ticket.fromTab = function(tab) {
	const {title} = tab;
	const url = tab.url.replace(/\?.*$/, '');
	const id = url.match(/browse\/(\w+-\d+)(:?\?|$)/)[1];
	const data = {title, url, id}
	return new Promise((resolve, reject) => {
		sendMessage(tab.id, {action: 'GET_TICKET_INFO'}).then(r => {
			resolve(new this(Object.assign(data, r)));
		});
	});
}

var ticketList; // global
var currentTab;
const filter = new Filter({
	open: {
		group: ['open'],
		color: 'DodgerBlue',
		show: true
	},
	todo: {
		group: ['todo'],
		color: 'ForestGreen',
		show: true
	},
	wip: {
		group: ['inprogress', 'wip'],
		color: 'YellowGreen',
		show: true
	},
	resolved: {
		group: ['resolved', 'scheduled'],
		color: 'GoldenRod',
		show: true
	},
	closed: {
		group: ['closed'],
		color: 'DarkGray',
		show: false
	}
});

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
	function renderAddBtn(tar) {
		btn = document.createElement('button');
		btn.textContent = 'Add this jira ticket.'
		btn.addEventListener('click', addTicket);
		tar.appendChild(btn);
	}
	function setupAddBtn() {
		const {url} = pagetab;
		if(/browse\/(\w+-\d+)(:?\?|$)/.test(url)) {
			sendMessage(pagetab.id, {action: 'IS_READY'}).then(r => {
				if(r) {
					renderAddBtn(document.querySelector('body > footer .btns'));
				}
			});
		}
	}
	load().then((list) => {
		if(Object.keys(list).length) {
			ticketList = list.data.map(t => new Tabs (t.name, t.tickets));
		} else {
			ticketList = initTicketList();
		}
		document.querySelector('nav .new_tab').addEventListener('click', () => {
			ticketList.push(new Tabs('New Tab'))
			save();
		});
		selectTab(ticketList[0]);
		setupAddBtn();
	});
});
