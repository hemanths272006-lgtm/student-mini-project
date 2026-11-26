import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file if present
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "students.db")

# Read database URL (Supabase PostgreSQL or fallback to SQLite)
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DATABASE_URL")

engine = None

if DATABASE_URL:
    # Ensure scheme uses psycopg2 for SQLAlchemy 2.0+
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    try:
        # Fast connection probe to ensure remote database is active (not paused)
        probe_engine = create_engine(
            DATABASE_URL,
            connect_args={"connect_timeout": 4}
        )
        with probe_engine.connect() as conn:
            pass
        probe_engine.dispose()
        print("Connected to Supabase PostgreSQL database successfully.")
        
        engine = create_engine(
            DATABASE_URL,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5
            }
        )
    except Exception as err:
        print(f"Notice: Remote database unreachable ({err}). Using resilient local database fallback.")
        engine = None

if engine is None:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
