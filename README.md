# 🦫 Productivity App - Capybara Power!

> がんばって！ (Ganbatte!) - Let's do our best! 🌸

A beautiful, feature-rich productivity application with Google Calendar integration, Pomodoro timer, task management, and a motivational capybara mascot!

![PWA](https://img.shields.io/badge/PWA-enabled-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## ✨ Features

### 📱 **Mobile-First Progressive Web App (PWA)**
- **Installable** on mobile and desktop
- **Offline support** with service workers
- **Auto-update notifications** - No manual refresh needed!
- **Pull-to-refresh** - Standard mobile gesture for reloading tasks
- **Optimized mobile UI** - Collapsible stats, responsive design
- **Bottom navigation** on mobile, top tabs on desktop
- **Touch-friendly** - Large tap targets, smooth animations

### ✅ **Advanced Task Management**
- **5 Task Types:**
  - 📅 Daily - Day-to-day tasks
  - 📆 Weekly - Weekly objectives
  - 🗓️ Monthly - Monthly goals
  - 🎯 Long Term - Big picture goals
  - 💪 Gym Workout - Fitness tracking

- **Recurring Tasks:**
  - Daily tasks that auto-reset at specified time
  - Weekly tasks that reset on specific day
  - Monthly tasks that reset on specific date
  - Customizable reset times

- **Task Features:**
  - ✏️ **Full task editing** - Edit all fields including recurring settings
  - 📅 Due dates with quick presets (Today, Tomorrow, Next week, etc.)
  - 📝 Rich descriptions
  - ⏸️ "Pause on Away" - Auto-pause when you're traveling
  - 🎨 Beautiful gradient cards with emojis
  - 🗑️ Delete with confirmation

### 📅 **Google Calendar Integration**
- **Two-way sync** with Google Calendar
- OAuth 2.0 secure authentication
- **Sync tasks TO calendar** - One click to add tasks as events
  - Tasks marked as [DONE] when completed
  - Auto-updates event title and description
- **Calendar badge** shows connection status
- Re-authorization flow for updating permissions

### ⏱️ **Pomodoro Timer**
- **Perfectly centered** timer with responsive design
- Three modes:
  - 🎯 Work (25 min) - Focus time
  - ☕ Break (5 min) - Short break
  - 🌴 Long Break (15 min) - Extended rest
- **Visual progress** - Circular progress indicator
- **Session tracking** - Count completed pomodoros
- **Auto mode switching** - Breaks after work sessions
- **Smooth animations** with Framer Motion

### 📊 **Smart Stats & Analytics**
- **Collapsible on mobile** - Save screen space
- Real-time statistics:
  - 📊 Total tasks
  - ✅ Completed tasks
  - ⏳ Pending tasks
  - 🎯 Success rate percentage
- **Interactive cards** with hover effects

### 🔥 **Streak Tracking** (Coming Soon)
- Track consecutive daily completions
- Longest streak records
- Motivational progress display

### 💪 **Gym Tracker**
- Dedicated workout tracking
- Exercise logging
- Progress monitoring

### ✈️ **Away Mode**
- Mark periods when you're away/traveling
- Auto-pause selected tasks
- Resume when you return

### 👤 **User Account**
- **User profile display**
  - Desktop: Badge in header
  - Mobile: Avatar card in menu drawer
- Email and name shown
- Account management

### 🎨 **Beautiful UI/UX**
- **Catppuccin Mocha** color theme
- **Smooth animations** with Framer Motion
- **Gradient backgrounds** and cards
- **Glass morphism** effects
- **Responsive design** - Mobile-first approach
- **Capybara mascot** - Appears randomly to motivate you!
  - Random entry from left or right
  - Motivational messages
  - Subtle animations
  - Position optimized for mobile (doesn't block UI)

### 🚀 **Performance & UX**
- **Fast intro animation** (1.5s on desktop, disabled on mobile)
- **Pull-to-refresh** on mobile
- **Optimized timer** with responsive sizing
- **PWA auto-update** - 3-second notification then reload
- **Hourly update checks**
- **Network-first caching** for API calls

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Vite PWA Plugin** - Progressive Web App features
- **Zustand** - State management
- **date-fns** - Date utilities

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **Google OAuth 2.0** - Secure authentication
- **Google Calendar API** - Calendar integration

### Deployment
- **Frontend:** Vercel (auto-deploy from main branch)
- **Backend:** Render (auto-deploy from main branch)
- **Database:** Render PostgreSQL

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL
- Google Cloud Project with Calendar API enabled

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file:
# VITE_API_URL=http://localhost:8000
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

npm run dev  # Development server at http://localhost:5173
npm run build  # Production build
npm run preview  # Preview production build
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost/productivity_app
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret
# FRONTEND_URL=http://localhost:5173
# SECRET_KEY=your-secret-key-here

# Run database migrations
python -m alembic upgrade head

# Or run the SQL migration manually:
psql $DATABASE_URL < backend/migrations/add_recurring_fields.sql

# Start the server
uvicorn app.main:app --reload  # Development server at http://localhost:8000
```

### Google Cloud Setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Calendar API**
3. Create **OAuth 2.0 credentials**
4. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production frontend URL
5. Download credentials and add to `.env`

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt
3. Or use browser menu → "Add to Home Screen"
4. App installs like a native app!

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or go to browser menu → "Install Productivity App"
3. App opens in standalone window

## 🎯 Usage

### Creating Tasks
1. Click "✨ Add New Task" button
2. Enter title and optional description
3. Select task type (Daily, Weekly, Monthly, etc.)
4. Set due date using quick presets or custom picker
5. For Daily/Weekly/Monthly: Toggle "Make recurring"
   - Daily: Set reset time
   - Weekly: Choose day of week + time
   - Monthly: Choose day of month + time
6. Toggle "Pause when I'm away" if needed
7. Click "Add Task"

### Syncing with Google Calendar
1. Connect your Google account (Calendar button in header)
2. Grant calendar permissions
3. Click the 📅 icon on any task to sync
4. Task appears in your Google Calendar
5. When you complete the task, calendar event updates to "[DONE]"

### Using Pomodoro Timer
1. Navigate to "Focus" tab (⏱️)
2. Choose mode: Work / Break / Long Break
3. Click ▶ to start timer
4. Timer counts down with visual progress
5. Complete 8 pomodoros to master productivity!

### Pull to Refresh (Mobile)
1. Scroll to top of tasks list
2. Pull down to trigger refresh
3. Release when you see "Release to refresh"
4. Tasks reload automatically

## 🔄 Recent Updates

### v1.5.0 - Mobile UI Overhaul
- ❌ Disabled annoying intro animation on mobile
- ⚡ Simplified desktop intro (1.5s from 4.8s)
- 📐 Perfect timer centering with responsive sizing
- 📊 Collapsible stats section on mobile
- 🔄 Added pull-to-refresh functionality
- 👆 Improved touch targets and spacing

### v1.4.0 - Task Editing & User Display
- ✏️ Full task editing with calendar sync
- 👤 User account display in header/menu
- 🔧 Fixed recurring tasks time format bug

### v1.3.0 - Recurring Tasks
- 🔄 Daily/Weekly/Monthly recurring tasks
- ⏰ Customizable reset times
- 📅 Added monthly task type
- 💾 Database migration for recurring fields

### v1.2.0 - Google Calendar Integration
- 📅 Two-way calendar sync
- ✅ Auto-mark tasks as [DONE] in calendar
- 🔐 OAuth 2.0 secure authentication

### v1.1.0 - PWA Features
- 📱 Progressive Web App support
- 🔄 Auto-update notifications
- 📴 Offline support
- 🏠 Installable app

## 🗺️ Roadmap

### Planned Features
- [ ] **ONCE task type** - One-time tasks that don't repeat
- [ ] **French i18n** - Full French translation + language switcher
- [ ] **arXiv Paper Retrieval** - PhD research integration
  - Experimental HEP papers
  - High Energy Physics - Phenomenology
  - ML breakthroughs
  - Topic filtering for PhD research
- [ ] **Sync FROM Google Calendar** - Import calendar events as tasks
- [ ] **Streak tracking backend** - Server-side streak calculation
- [ ] **Push notifications** - Browser notifications for task reminders
- [ ] **Dark mode toggle** - Switch between light/dark themes
- [ ] **Task templates** - Save and reuse common tasks
- [ ] **Export/Import** - Backup and restore tasks
- [ ] **Team collaboration** - Share tasks with others

## 📄 License

MIT License - feel free to use this project!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Created with ❤️ by the Capybara Productivity Team

---

**がんばって！ (Ganbatte!)** - Let's do our best! 🦫✨
