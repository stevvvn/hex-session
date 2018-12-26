module.exports = {
	'session': {
		'description': 'Track user sessions',
		'after': [ 'memory-store', 'mysql-store', 'pgsql-store', 'sqlite-store' ]
	},
	'memory-store': {
		'description': 'In-memory session storage, not suitable for production'
	},
	'mysql-store': {
		'description': 'MySQL session storage',
		'deps': [ 'hex-db-mysql.handle' ]
	},
	'pgsql-store': {
		'description': 'PostgreSQL session storage',
		'deps': [ 'hex-db-pgsql.handle' ]
	},
	'sqlite-store': {
		'description': 'SQLite session storage. Only slightly better than memory storage',
		'deps': [ 'hex-db-sqlite.handle' ]
	}
};
