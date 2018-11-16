'use strict';
module.exports = {
	'up': (dbh) => dbh.run('CREATE TABLE sessions(id text not null primary key, params text, freshness timestamp not null default current_timestamp)'),
	'down': (dbh) => dbh.run('DROP TABLE sessions')
};
