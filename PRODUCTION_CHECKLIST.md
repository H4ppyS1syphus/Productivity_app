# Production Readiness Checklist ✅

Before deploying to production, verify all features work correctly:

## ✅ Task Editing (Enhanced)
- [ ] Click edit button on any task
- [ ] Modal opens with all fields populated
- [ ] Can change task title
- [ ] Can change task description
- [ ] Can change task type (daily/weekly/monthly/long_term/gym_workout)
- [ ] Can set/change due date using quick buttons
- [ ] Can set/change due date using date picker
- [ ] Can toggle "Pause on away" checkbox
- [ ] Can toggle "Make this a recurring task" checkbox
- [ ] When recurring is enabled, shows appropriate fields:
  - Daily: Time picker
  - Weekly: Time picker + Day of week selector
  - Monthly: Time picker + Day of month input
- [ ] Can save changes and they persist
- [ ] Can cancel editing without saving changes

## ⏱️ Task-Timer Integration (New Feature)
- [ ] Each task card shows a timer icon button
- [ ] Clicking timer button starts Pomodoro timer
- [ ] Automatically switches to Pomodoro tab
- [ ] Timer button shows active state (pulsing/highlighted) for active task
- [ ] Pomodoro timer displays "Working on" card with:
  - Rotating timer icon
  - Task title
  - Task description (if available)
  - Clear button (X)
- [ ] Clicking clear button removes task association
- [ ] Timer continues running after clearing task association
- [ ] Can start timer on a different task while one is active
- [ ] Active task display persists when switching timer modes (work/break/long break)

## 📄 arXiv Paper Integration (NEW!)
- [ ] Papers tab appears in navigation
- [ ] Can switch between PhD Research and ML/AI Papers categories
- [ ] PhD Research category fetches papers from hep-ex, hep-ph, cs.LG
- [ ] Papers are filtered by PhD topic keywords (long-lived axion-like particles ATLAS)
- [ ] ML/AI category fetches papers from cs.LG, cs.AI, stat.ML categories
- [ ] Papers display with:
  - Title (clickable link to arXiv)
  - Authors (with "et al." for many authors)
  - Abstract/Summary (expandable)
  - Publication date
  - Category badge (hep-ex, hep-ph, cs.LG, etc.)
  - arXiv ID
- [ ] "New" badge shows for papers published today
- [ ] Can expand/collapse paper summaries by clicking
- [ ] Can add paper to tasks (creates long-term task with paper details)
- [ ] Adding paper to tasks switches to Tasks tab automatically
- [ ] Refresh button reloads papers
- [ ] Shows last updated timestamp
- [ ] Loading state displays skeleton cards
- [ ] Error state shows with retry button
- [ ] Empty state shows helpful message
- [ ] Search functionality works (if implemented)
- [ ] Category filters work correctly
- [ ] Responsive design works on mobile and desktop

## 📱 Mobile UI (Previously Enhanced)
- [ ] Intro animation skips on mobile devices
- [ ] Pomodoro timer is properly centered on mobile
- [ ] Stats section is collapsible on mobile
- [ ] Pull-to-refresh works on task list
- [ ] All buttons have adequate touch targets
- [ ] Timer integration works smoothly on mobile

## 🔄 Recurring Tasks
- [ ] Can create daily recurring tasks
- [ ] Can create weekly recurring tasks (specific day)
- [ ] Can create monthly recurring tasks (specific day of month)
- [ ] Recurring tasks reset at specified time
- [ ] Recurrence time format is HH:MM:SS
- [ ] Day of week: 0 = Monday, 6 = Sunday

## 📅 Google Calendar Integration
- [ ] Can sync tasks to Google Calendar
- [ ] Synced tasks show green calendar icon
- [ ] Can unsync tasks from calendar
- [ ] Calendar events update when task is edited

## 🎯 General Task Management
- [ ] Can create new tasks
- [ ] Can complete/uncomplete tasks
- [ ] Can delete tasks (with confirmation)
- [ ] Task types display with correct colors
- [ ] Due dates show correctly
- [ ] Overdue tasks show warning indicator
- [ ] Empty state shows when no tasks

## 🔨 Pomodoro Timer
- [ ] Can switch between Focus Time/Short Break/Long Break
- [ ] Timer displays correctly
- [ ] Play/Pause button works
- [ ] Reset button works
- [ ] Session counter increments
- [ ] Completed pomodoros show as filled dots
- [ ] Sound/notification when timer completes (if enabled)

## 🔐 Authentication
- [ ] Google login works
- [ ] Session persists across page reloads
- [ ] Logout works correctly
- [ ] Redirects to login when not authenticated

## 💾 Data Persistence
- [ ] Tasks persist across page reloads
- [ ] Pomodoro progress persists
- [ ] Preferences persist (theme, settings)

## 🏗️ Build & Performance
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] App loads in < 3 seconds
- [ ] PWA service worker registers correctly
- [ ] App can be installed as PWA
- [ ] Offline mode works (cached pages)

## 🧪 Automated Tests
- [ ] Run `npm run test:run`
- [ ] Core functionality tests pass (85+ tests passing)
- [ ] arXiv service tests pass (18 tests)
- [ ] arXiv component tests pass (38 tests)
- [ ] Note: Some animation-heavy UI tests may need manual verification (3 skipped)

## 🔍 Manual Test Scenarios

### Scenario 1: Edit a Recurring Task
1. Create a weekly recurring task
2. Click edit button
3. Change from weekly to monthly
4. Verify monthly-specific fields appear
5. Set day of month to 15
6. Save and verify changes

### Scenario 2: Task Timer Workflow
1. Create 3 different tasks
2. Start timer on Task 1
3. Verify timer shows "Working on Task 1"
4. Switch to Task 2 without clearing Task 1
5. Verify timer now shows "Working on Task 2"
6. Complete a Pomodoro session
7. Verify task display persists through session completion

### Scenario 3: Mobile Experience
1. Open app on mobile device (or use Chrome DevTools mobile emulation)
2. Verify intro animation is skipped
3. Test pull-to-refresh on task list
4. Expand/collapse stats section
5. Start timer from a task
6. Verify timer is properly centered and responsive

### Scenario 4: Full Task Lifecycle
1. Create a task with all fields filled
2. Sync to Google Calendar
3. Start timer for the task
4. Complete the task while timer is running
5. Edit the completed task
6. Delete the task
7. Verify no errors at any step

## 🚀 Backend Health Check
- [ ] Backend API is running and accessible
- [ ] Database migrations are up to date
- [ ] Google Calendar OAuth is configured
- [ ] CORS settings allow frontend origin
- [ ] API endpoints respond within acceptable timeframes

## 🐛 Known Issues & Limitations
- Animation-heavy modals may not render perfectly in test environment (manual verification required)
- Timer-task association is stored in frontend state only (doesn't persist across page reloads)
- Multiple browser tabs may have sync issues with active timer task

## 📊 Metrics to Monitor Post-Deploy
- Task completion rate
- Pomodoro session completion rate
- Edit modal usage
- Timer integration usage
- Mobile vs desktop usage patterns
- Error rates in browser console

---

**Approval Sign-off:**
- [ ] All checklist items verified
- [ ] Manual test scenarios completed
- [ ] Build successful
- [ ] Tests passing (automated where possible)
- [ ] Ready for production deployment

**Date:** __________
**Tested by:** __________
**Approved by:** __________
