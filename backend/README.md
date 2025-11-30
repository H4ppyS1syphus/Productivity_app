# Productivity App - Backend

FastAPI-based backend for the productivity application.

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required configuration:
- Database connection string
- JWT secret key
- Google OAuth2 credentials

### 4. Setup PostgreSQL database

```bash
# Create database
createdb productivity_app

# Or using psql
psql -c "CREATE DATABASE productivity_app;"
```

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the development server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Configuration management
│   ├── database.py      # Database connection
│   ├── models/          # SQLAlchemy models
│   ├── routers/         # API route handlers
│   └── services/        # Business logic
├── alembic/             # Database migrations
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (not in git)
```

## Development

### Running tests

```bash
pytest
```

### Creating a new migration

```bash
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Code style

This project uses:
- Type hints for all function signatures
- Docstrings for all public functions
- Black for code formatting
- isort for import sorting

## API Endpoints

See the interactive API documentation at `/docs` when running the server.

Main endpoints:
- `/api/auth/*` - Authentication
- `/api/tasks/*` - Task management
- `/api/streaks/*` - Streak tracking
- `/api/calendar/*` - Calendar integration
- `/api/gym/*` - Gym progress tracking
- `/api/pomodoro/*` - Pomodoro timer
