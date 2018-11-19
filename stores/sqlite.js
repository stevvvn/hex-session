'use strict';

const Store = require('express-session/session/store');

const reaper = (store, { intervalSeconds, lingerSeconds }) =>
	setInterval(() =>
		store.exec('run', 'DELETE FROM sessions WHERE (JulianDay() - JulianDay(freshness)) * 24 * 60 * 60 > $', [ lingerSeconds ]),
		intervalSeconds * 1000
	);

class SqliteStore extends Store
{
	constructor(app, reapOpts) {
		super();
		this.app = app;
		reaper(this, reapOpts);
	}

	get dbh() {
		if (!this.app.locals.sqlite) {
			throw new Error('you must depend on the hex-db-sqlite.handle middleware to use the sqlite session connector');
		}
		return this.app.locals.sqlite;
	}

	async exec(type, sql, ...params) {
		if (!this[sql]) {
			this[sql] = await this.dbh.prepare(sql);
		}
		return this[sql][type](params);
	}

	async get(id, cb) {
		const sess = await this.exec('get', 'SELECT params FROM sessions WHERE id = ?', id);
		cb(null, sess ? JSON.parse(sess.params) : null);
	}

	async set(id, session, cb) {
		await this.exec('run', 'INSERT INTO sessions(id, params) VALUES (? , ?)', id, JSON.stringify(session));
		cb();
	}

	async destroy(id, cb) {
		await this.exec('run', 'DELETE FROM sessions WHERE id = ?', id);
		cb();
	}

	async touch(id, _session, cb) {
		await this.exec('run', 'UPDATE sessions SET freshness = CURRENT_TIMESTAMP WHERE id = ?', id);
		cb();
	}
}

module.exports = SqliteStore;
