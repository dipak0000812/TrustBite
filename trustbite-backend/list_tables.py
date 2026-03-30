from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://trustbite_user:trustbite_dev_2024@localhost:5434/trustbite_db"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    res = conn.execute(text("SELECT tablename, tableowner FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
    print("Tables and Owners:")
    for row in res:
        print(f"Table: {row[0]}, Owner: {row[1]}")
