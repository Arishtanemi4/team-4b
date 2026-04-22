import sqlite3
import os
from fastapi import HTTPException

# 1. Get the directory of the current file (.../team-4b/backend/services)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Go up one level to 'backend'
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

# 3. Go up one more level to 'team-4b' (the root project folder)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

# 4. Point into the 'db' folder and select 'hcd.db'
DB_PATH = os.path.join(ROOT_DIR, 'db', 'hcd.db')

def get_team_data_from_db(team_number: str):
    """
    Connects to SQLite and fetches the password_hash and team_name 
    for the given team_number.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Parameterized query to prevent SQL Injection
        query = "SELECT password_hash, team_name FROM user_login WHERE team_number = ?"
        cursor.execute(query, (team_number,))
        
        return cursor.fetchone() # Returns a tuple: (password_hash, team_name)

def process_authentication(team_number: str, provided_password_hash: str) -> dict:
    """
    Fetches the stored hash from the database and compares it directly
    to the provided hash (no encryption/decryption involved).
    """
    # 1. Fetch the team's stored data from the SQLite database
    result = get_team_data_from_db(team_number)
    
    # 2. Check if the team exists
    if not result:
        raise HTTPException(status_code=401, detail="Invalid team number or password")
        
    stored_db_hash, team_name = result
        
    # 3. Direct string comparison (Plaintext check)
    if provided_password_hash != stored_db_hash:
        raise HTTPException(status_code=401, detail="Invalid team number or password")
    
    # 4. Success!
    return {
        "team_number": team_number,
        "team_name": team_name,
        "status": "Authentication successful"
    }