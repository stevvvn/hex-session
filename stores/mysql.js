'use strict';

const Store = require('express-session/session/store');

const reaper = (store, { intervalSeconds, lingerSeconds }) =>
	setInterval(() =>
		store.exec('DELETE FROM sessions WHERE CURRENT_TIMESTAMP - freshness > ?', lingerSeconds),
		intervalSeconds * 1000
	);

class mysqlStore extends Store
{
	constructor(app, reapOpts) {
		super();
		this.app = app;
		reaper(this, reapOpts);
	}

	get dbh() {
		if (!this.app.locals.mysql) {
			throw new Error('you must depend on the hex-db-pqsql.handle middleware to use the mysql session connector');
		}
		return this.app.locals.mysql;
	}

	async exec(sql, ...values) {
		const res = await this.dbh.query(sql, values);
		return res[0] ? res[0] : res;
	}

	async get(id, cb) {
		const res = await this.exec('SELECT params FROM sessions WHERE id = ?', id);
		cb(null, res[0] ? JSON.parse(res[0].params) : null);
	}

	async set(id, session, cb) {
		await this.exec('INSERT INTO sessions(id, params) VALUES (?, ?)', id, JSON.stringify(session));
		cb();
	}

	async destroy(id, cb) {
		await this.exec('DELETE FROM sessions WHERE id = ?', id);
		cb();
	}

	async touch(id, _session, cb) {
		await this.exec('UPDATE sessions SET freshness = CURRENT_TIMESTAMP WHERE id = ?', id);
		cb();
	}
}

module.exports = mysqlStore;
