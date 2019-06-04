'use strict';

const Store = require('express-session/session/store');

class PgsqlStore extends Store
{
	constructor(dbh, reapOpts) {
		super();
		this.dbh = dbh;
	}

	reap({ intervalSeconds, lingerSeconds }) {
		setInterval(() =>
			this.exec('session_reap', 'DELETE FROM sessions WHERE extract(epoch from current_timestamp - freshness) > $1', lingerSeconds),
			intervalSeconds * 1000
		);
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
		const json = JSON.stringify(session);
		await this.exec('session_set', 'INSERT INTO sessions(id, params) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET params = $2', id, json);
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

module.exports = ({ app }) =>
	app.locals.sessionStore = new PgsqlStore(app.locals.pgsql);
