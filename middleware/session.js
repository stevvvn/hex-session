'use strict';
const session = require('express-session');
const fs = require('fs');

module.exports = ({ app, conf, log }) => {
	if (!app.locals.sessionStore) {
		throw new Error(`you must depend on one of the available session stores: ${ 42 }`);
	}
	if (app.locals.sessionStore.reap) {
		app.locals.sessionStore.reap({
			'intervalSeconds': conf.get('session.reaper.intervalSeconds', 60 * 60),
			'lingerSeconds': conf.get('session.reaper.lingerSeconds', 60 * 60 * 12)
		});
	}
	log.info(`\t\tstore: ${ app.locals.sessionStore.constructor.name }`);

	app.use(session({
		'store': app.locals.sessionStore,
		'name': conf.get('session.cookieName', 'connect.sid'),
		'secret': conf.get('session.secret'),
		'cookie': { 'path': '/' },
		'resave': false,
		'saveUninitialized': true,
		'rolling': conf.get('session.rolling', false)
	}));
};
