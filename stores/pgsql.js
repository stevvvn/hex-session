'use strict';

const Store = require('express-session/session/store');

const reaper = (store, { intervalSeconds, lingerSeconds }) =>
	setInterval(() =>
		store.exec('session_reap', 'DELETE FROM sessions WHERE extract(epoch from current_timestamp - freshness) > $1', lingerSeconds),
		intervalSeconds * 1000
	);

class PgsqlStore extends Store
{
	constructor(app, reapOpts) {
		super();
		this.app = app;
		reaper(this, reapOpts);
	}

	get dbh() {
		if (!this.app.locals.pgsql) {
			throw new Error('you must depend on the hex-db-pqsql.handle middleware to use the pgsql session connector');
		}
		return this.app.locals.pgsql;
	}

	async exec(name, sql, ...values) {
		const res = await this.dbh.query({
			name,
			values,
			'text': sql
		});
		return res.rows ? res.rows[0] : res;
	}

	async get(id, cb) {
		const sess = await this.exec('session_get', 'SELECT params FROM sessions WHERE id = $1', id);
		cb(null, sess ? JSON.parse(sess.params) : null);
	}

	async set(id, session, cb) {
		await this.exec('session_set', 'INSERT INTO sessions(id, params) VALUES ($1, $2)', id, JSON.stringify(session));
		cb();
	}

	async destroy(id, cb) {
		await this.exec('session_destroy', 'DELETE FROM sessions WHERE id = $1', id);
		cb();
	}

	async touch(id, _session, cb) {
		await this.exec('session_touch', 'UPDATE sessions SET freshness = CURRENT_TIMESTAMP WHERE id = $1', id);
		cb();
	}
}

module.exports = PgsqlStore;
