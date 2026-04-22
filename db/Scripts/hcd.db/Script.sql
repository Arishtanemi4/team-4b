-- 1. Create the table with correct spelling
CREATE TABLE user_login (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_number TEXT NOT NULL,
    team_name TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Insert the data (fixed commas and column names)
INSERT INTO user_login (user_id, team_number, team_name, password_hash)
VALUES (
    999991, 
    '99A', 
    'TestTeamRR', 
    'sha256$somehashvalue123'
);

-- 3. Verify
SELECT * FROM user_login;