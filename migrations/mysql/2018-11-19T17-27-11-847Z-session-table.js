'use strict';
module.exports = {
	'up': (dbh) => dbh.query('CREATE TABLE sessions(id char(32) not null primary key, params text, freshness timestamp not null default current_timestamp)'),
	'down': (dbh) => dbh.query('DROP TABLE sessions')
};
