import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://trustbite_user:trustbite_dev_2024@localhost:5434/trustbite_db"

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT current_user, current_database()"))
        print(f"Connection successful: {result.fetchone()}")
        
        # Check extensions
        ext_result = conn.execute(text("SELECT extname FROM pg_extension"))
        print(f"Extensions: {[row[0] for row in ext_result]}")

        # Try to create a dummy table
        conn.execute(text("CREATE TABLE IF NOT EXISTS test_table (id serial PRIMARY KEY, name varchar(50))"))
        print("Table creation successful")
        conn.execute(text("DROP TABLE test_table"))
        print("Table drops successful")
        conn.commit()
        
except Exception as e:
    print(f"Action failed: {e}")
