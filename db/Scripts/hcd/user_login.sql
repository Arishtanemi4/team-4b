drop table if exists user_login;

create table user_login(
	user_id integer primary key autoincrement,
	team_id text not null,
	team_name text not null,
	password_hash TEXT NOT NULL
);


select * from user_login