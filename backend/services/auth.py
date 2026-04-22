import csv
import os
from fastapi import HTTPException

# 1. Get the directory of the current file (.../root/backend/services)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Go up one level to the 'backend' directory (.../root/backend)
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

# 3. Go up one MORE level to your project 'root' directory (.../root)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

# 4. Point into the root's 'db' folder and target 'users.csv'
CSV_PATH = os.path.join(ROOT_DIR, 'db', 'users.csv')

def get_team_data_from_csv(team_number: str):
    """
    Opens the CSV file, reads it row by row, and looks for a matching team_number.
    """
    try:
        # Note: Using utf-8-sig to avoid the hidden Windows BOM character issue
        with open(CSV_PATH, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                if row['team_number'] == team_number:
                    return row['password_hash'], row['team_name']
                    
    except FileNotFoundError:
        print(f"Error: Could not find CSV at {CSV_PATH}")
        raise HTTPException(status_code=500, detail="Internal server error: Data source missing")
        
    return None



def process_authentication(team_number: str, provided_password_hash: str) -> dict:
    """
    Authenticates by comparing the provided hash against the CSV data.
    """
    # 1. Fetch the data using the new CSV function
    result = get_team_data_from_csv(team_number)
    
    # 2. Check if the team exists
    if not result:
        raise HTTPException(status_code=401, detail="Invalid team number or password")
        
    stored_db_hash, team_name = result
        
    # 3. Direct string comparison
    if provided_password_hash != stored_db_hash:
        raise HTTPException(status_code=401, detail="Invalid team number or password")
    
    # 4. Success!
    return {
        "team_number": team_number,
        "team_name": team_name,
        "status": "Authentication successful"
    }