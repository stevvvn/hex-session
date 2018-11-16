'use strict';
// @flow
const session = require('express-session');

module.exports = ({ app, conf, log }) => {
	const storeType = conf.get('session.store', 'memory');
	const store = new (require(`${ __dirname }/../stores/${ storeType }`))(
		app,
		{
			// interval to scan for stale sessions
			'intervalSeconds': conf.get('session.reaper.intervalSeconds', 60 * 60),
			// what's considered stale
			'lingerSeconds': conf.get('session.repear.lingerSeconds', 60 * 60 * 12)
		}
	);
	log.info(`\t\tstore: ${ storeType }`);
	if (storeType === 'memory') {
		log.warn('memory store for sessions is not suitable for production. define session.store to choose another');
	}

	app.use(session({
		store,
		'secret': conf.get('session.secret'),
		'cookie': { 'path': '/' },
		'resave': false,
		'saveUninitialized': true,
		'rolling': conf.get('session.rolling', false)
	}));
};
