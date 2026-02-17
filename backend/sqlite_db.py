import aiosqlite
import json
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "trading.db"

class SQLiteDB:
    def __init__(self):
        self.db_path = DB_PATH

    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    data TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS positions (
                    id TEXT PRIMARY KEY,
                    data TEXT
                )
            """)
            await db.commit()

    async def get_account(self):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT data FROM accounts LIMIT 1") as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row['data'])
                return None

    async def update_account(self, account_data):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO accounts (id, data) VALUES (?, ?)",
                (account_data['id'], json.dumps(account_data))
            )
            await db.commit()

    async def get_positions(self):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT data FROM positions") as cursor:
                rows = await cursor.fetchall()
                return [json.loads(row['data']) for row in rows]

    async def update_position(self, position_data):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO positions (id, data) VALUES (?, ?)",
                (position_data['id'], json.dumps(position_data))
            )
            await db.commit()

sqlite_db = SQLiteDB()
