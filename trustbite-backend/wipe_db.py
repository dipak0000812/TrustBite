from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://trustbite_user:trustbite_dev_2024@localhost:5434/trustbite_db"
engine = create_engine(DATABASE_URL)

tables = ["favourites", "reviews", "menu_items", "messes", "users", "students", "alembic_version"]

with engine.connect() as conn:
    for table in tables:
        try:
            conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            print(f"Dropped table: {table}")
        except Exception as e:
            print(f"Failed to drop {table}: {e}")
    conn.commit()
