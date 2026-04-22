drop table if exists user_login;

CREATE TABLE user_login (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_number text not null unique,
    team_name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);



select * from user_login;
