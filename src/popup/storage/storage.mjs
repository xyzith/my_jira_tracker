import initValue from './initValue.mjs';
import { sleep } from '../utils.mjs';

export default new class {
	constructor() {
		this.watched = {};
		this[Symbol.for('local-data')] = new Proxy({}, {
			set: (db, key, value) => {
				const origValue = db[key];
				if (origValue !== value) {
					window.setTimeout(() => this.feed(key, value));
					db[key] = value;
				}
				return true;
			},
		});
		this.setData(initValue);

		//XXX
		this.syncData();
	}

	load(key) {
		return new Promise((resolve) => {
			chrome.storage.local.get(key , (value) => resolve(value));
		});
	}

	async save(key, data) {
		await new Promise((resolve) => {
			chrome.storage.local.set({ [key]: data }, resolve);
		});
		await this.syncData();
	}

	async syncData() {
		const storageData = await this.load();
		const localData = this[Symbol.for('local-data')];
		Object.assign(localData, storageData);
	}

	setData(data) {
		const localData = this[Symbol.for('local-data')];
		Object.entries(data).forEach(([key, value]) => {
			localData[key] = (typeof value === 'object') ? Object.freeze(value) : value;
		});
	}

	getData(key) {
		const localData = this[Symbol.for('local-data')];
		if (key) {
			return localData[key];
		}
		return Object.assign({}, localData);
	}

	watch(key = Symbol.for('watchall'), callback) {
		const { watched } = this;
		const handlers = watched[key] || [];
		handlers.push(callback);
		watched[key] = handlers;
	}

	async feed(key, value) {
		const { watched } = this;
		const globalCallbacks = watched[Symbol.for('watchall')] || [];
		const callbacks = (watched[key] || []).concat(globalCallbacks);
		await sleep(0);
		callbacks.forEach((callback) => {
			callback(value, key);
		});
	}
};
