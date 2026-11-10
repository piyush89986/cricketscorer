# CricScore — Cricket Tournament Management & Live Scoring Platform

A digital cricket management and real-time live scoring web application built for local cricket tournaments, leagues, gully cricket, academies, schools, and amateur leagues.

---

## 🌟 Key Features

### 1. Ball-by-Ball Cricket Scoring Engine
- **Tablet & Mobile Touch Keypad**: Large, easily accessible buttons for runs (`0`, `1`, `2`, `3`, `4`, `6`), extras (`Wide`, `No Ball`, `Bye`, `Leg Bye`, `Penalty`), and dismissals (`Wicket!`).
- **Cricket Rules**:
  - Authoritative server-side calculation (prevents client tampering).
  - Accurate legal ball tracking (overs stored as integer legal balls).
  - Strike rotation on odd runs & over completion.
  - Wickets handling: Bowled, Caught, LBW, Run Out (striker/non-striker), Stumped, Hit Wicket, Retired Out.
  - Fall of wickets logging, bowler figures, and maiden overs.
  - End-of-over bowler rotation prompt.
  - **Undo Last Delivery**: Rewinds deliveries, restores scorecards, and logs audit events.
  - Idempotency keys to prevent accidental double-tap delivery submissions.

### 2. Fullscreen Stadium TV Scoreboard (`/display/[matchId]`)
- High-contrast stadium broadcasting dark aesthetic optimized for large LED screens, projectors, and TVs.
- **Multiple Display Modes**:
  1. Main Stadium Live Scoreboard (Giant typography, current striker, non-striker, bowler, last balls).
  2. Batting Scorecard.
  3. Bowling Figures Card.
  4. Match Result Celebration.
- **Auto-Cycle Timer**: Automatically rotates between layouts every 12 seconds.
- **Fullscreen Mode**: One-click fullscreen display with zero clutter.

### 3. Public Live Match Center (`/live/[matchId]`)
- Real-time updates without page reload via **Socket.IO** and **Server-Sent Events (SSE)** fallback.
- Live telemetry HUD: Batters, bowler figures, partnership, last 12 deliveries timeline.
- Full batting and bowling scorecards.
- Chronological ball-by-ball commentary.
- Match Info & Playing XIs.
- WhatsApp score sharing & Printable PDF scorecard export.

### 4. Tournament Management & Automated Fixture Generator
- Formats: Round Robin, Single Elimination Knockouts, Groups, Double Round Robin.
- One-click **Automated Fixture Generator** with team pairings.
- Customizable rules: Win points, Tie points, Loss points, No Result points.
- **Points Table with Net Run Rate (NRR)**:
  - Strict ICC standard NRR calculation.
  - Includes competition-specific all-out rule adjustments.

### 5. Teams & Reusable Player Registry
- Create franchise teams with custom hex color branding and short codes.
- Manage squad rosters, assign Captain (C) and Wicketkeeper (WK).
- Global Player Registry: Batting style, bowling style, playing role, and career aggregates.

### 6. Analytics & Leaderboards
- **Orange Cap**: Top Run Scorers leaderboard with strike rates and boundaries.
- **Purple Cap**: Leading Wicket Takers leaderboard with economy rates and overs.
- Visual charts with Recharts (match status distribution, scoring benchmarks).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 App Router (React 18, TypeScript)
- **Styling**: Tailwind CSS with dark stadium broadcast palette & Lucide React icons
- **State Management**: Zustand
- **Real-Time Synchronization**: Persistent Socket.IO Server & Server-Sent Events (SSE)
- **Database**: MongoDB Atlas / Mongoose ORM (with dev fallback)
- **Security & Auth**: JWT HTTP-only cookies, bcrypt password hashing, Role-Based Access Control (RBAC)
- **Charts**: Recharts

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or inspect `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/cricscore
JWT_SECRET=cricscore_jwt_ultra_secure_secret_key_prod_9981273918237
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### 3. Start the Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

Click **"Load Sample Tournament"** on the home page or use these credentials:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Tournament Organizer** | `organizer@cricscore.com` | `password123` | Full Organizer Hub, Tournaments, Squads, Fixtures |
| **Match Scorer** | `scorer@cricscore.com` | `password123` | Official Scorer Desk, Ball-by-ball Keypad |
| **Super Admin** | `admin@cricscore.com` | `password123` | Platform oversight & user management |
| **Spectator** | Any / No login required | - | Public Live Match Center, TV Display, Points Tables |

---

## 📍 Route Directory

| URL Route | Purpose |
| :--- | :--- |
| `/` | Landing page, featured match spotlight, sample tournament loader |
| `/login` | Authentication page with 1-click quick role login buttons |
| `/register` | User signup with role selection (Organizer, Scorer, Spectator) |
| `/dashboard` | Organizer command center with KPI metrics, charts, ongoing matches |
| `/dashboard/tournaments` | Tournaments list, management, and standings |
| `/dashboard/tournaments/new`| Tournament creation wizard with rules & points setup |
| `/dashboard/tournaments/[id]`| Tournament details, automated fixture generator, points table |
| `/dashboard/teams` | Team clubs roster |
| `/dashboard/teams/[id]` | Team squad management, captains, wicketkeepers |
| `/dashboard/players` | Reusable player registry, search, filters |
| `/dashboard/matches` | Match fixtures listing with status filters |
| `/dashboard/matches/new` | Single match scheduler |
| `/dashboard/analytics` | Tournament analytics, Orange Cap & Purple Cap leaderboards |
| `/scorer` | Scorer desk match selection |
| `/scorer/[matchId]` | Flagship ball-by-ball touch scoring console |
| `/live` | Public live matches hub |
| `/live/[matchId]` | Real-time live scorecard, commentary, print export |
| `/display/[matchId]` | Stadium TV scoreboard mode with auto-cycle & fullscreen |
