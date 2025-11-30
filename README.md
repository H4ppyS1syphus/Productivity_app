# Productivity App

A modern, modular Progressive Web App for personal productivity, featuring task management, habit tracking, Pomodoro timer, gym progress tracking, and more.

## Features

- **Cross-Platform**: Works on desktop and mobile (PWA)
- **Task Management**: Daily, weekly, and long-term tasks
- **Streaks**: Gamified habit tracking with evolving visuals
- **Google Calendar Integration**: Two-way sync
- **Smart Scheduling**: Automatic suggestions for light days
- **Pomodoro Timer**: Integrated focus timer
- **Gym Tracking**: Track 1RM progress (squat, bench, deadlift) and bodyweight
- **Away Mode**: Pause tasks during travel
- **Modern UI**: Clean, responsive design with dark mode
- **Offline Support**: Works without internet connection

## Tech Stack

### Backend
- **FastAPI** (Python) - Modern, fast web framework
- **PostgreSQL** - Reliable database
- **SQLAlchemy** - ORM for clean data models
- **Google Calendar API** - Calendar integration
- **WebSockets** - Real-time sync

### Frontend
- **React 18** + **TypeScript** - Type-safe UI
- **Vite** - Fast build tool
- **Tailwind CSS** + **shadcn/ui** - Modern UI components
- **Zustand** - State management
- **Framer Motion** - Smooth animations
- **PWA** - Installable, offline-capable

## Project Structure

```
productivity-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # Database models
│   │   ├── routers/  # API endpoints
│   │   └── services/ # Business logic
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── features/ # Feature modules
│   │   ├── components/ # UI components
│   │   └── stores/   # State management
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

4. **Setup database**:
   ```bash
   createdb productivity_app
   alembic upgrade head
   ```

5. **Run the server**:
   ```bash
   uvicorn app.main:app --reload
   ```

   Backend API will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API URL and Google Client ID
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## Development

### Running Both Servers

In separate terminals:

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Code Style

- **Backend**: Follow PEP 8, use type hints, write docstrings
- **Frontend**: TypeScript strict mode, ESLint, modular components
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## Implementation Roadmap

### Phase 1: Foundation (MVP) - Current
- [x] Project setup (backend + frontend)
- [ ] Google OAuth2 authentication
- [ ] Basic task CRUD operations
- [ ] Task list UI
- [ ] Real-time sync infrastructure

### Phase 2: Calendar & Scheduling
- [ ] Google Calendar two-way sync
- [ ] Smart task scheduler
- [ ] Calendar view component

### Phase 3: Streaks & Gamification
- [ ] Streak tracking system
- [ ] Animated visuals
- [ ] Milestone celebrations

### Phase 4: Pomodoro & Focus
- [ ] Pomodoro timer
- [ ] Focus mode UI
- [ ] Notification system

### Phase 5: Gym Tracking
- [ ] 1RM entry and tracking
- [ ] Progress charts
- [ ] Achievement system

### Phase 6: Away Mode
- [ ] Away period management
- [ ] Per-task pause settings
- [ ] Streak pause logic

### Phase 7: Polish & UX
- [ ] Animations and transitions
- [ ] Mobile optimization
- [ ] Dark mode
- [ ] PWA installation prompts

### Future Enhancements
- [ ] KDE Plasma integration
- [ ] System tray widget
- [ ] KRunner plugin

## Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss features or improvements.

## License

MIT License - See LICENSE file for details

---

**Author**: PhD student at Sorbonne University (HEP + ML, ATLAS Experiment)
**Hobbies**: Coding, Powerlifting, Guitar, Specialty Coffee
**Purpose**: Built to combat procrastination and maintain productivity
