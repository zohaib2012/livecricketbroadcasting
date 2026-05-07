# CricLive - Live Cricket Broadcasting Platform

## Project Status: 90% Complete

### ✅ Completed Features

1. **Database & Schema**
   - Complete Prisma schema with Users, Tournaments, Teams, Players, Matches, Innings, Balls, Scorecards
   - PostgreSQL database configured (Neon DB)
   - Seed data with admin@criclive.com / admin123

2. **Authentication**
   - NextAuth v5 with credentials provider
   - Role-based access (SUPER_ADMIN, ADMIN, SCORER, VIEWER)
   - Login, Register pages
   - Middleware protection for admin/scorer routes

3. **Theme System (2 Themes)**
   - Default: Purple gradient dark theme (free)
   - Premium Gold: Amber gradient theme (paid)
   - Theme switcher in navbar

4. **Admin Panel**
   - Dashboard with stats
   - Tournament management (create, edit, list)
   - Team management
   - Player management
   - Match setup with toss and playing XI selection
   - Points table and fixtures

5. **Live Scoring**
   - Real-time ball-by-ball scoring
   - Socket.io integration for live updates
   - Score controls (runs, wickets, extras)
   - Overlay pages for OBS broadcasting

6. **Public Pages**
   - Tournament listing with filters
   - Tournament details with points table
   - Live match viewer
   - Match scorecards

7. **OBS Overlays**
   - Full overlay with scorecard
   - Compact bottom bar
   - Lower-third graphic

### 🔧 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (.env):**
   ```
   DATABASE_URL="your_postgres_url"
   NEXTAUTH_SECRET="your_secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   ```

3. **Setup database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Run development servers:**
   ```bash
   # Terminal 1 - Next.js
   npm run dev
   
   # Terminal 2 - Socket.io server
   npm run server
   ```

5. **Login credentials:**
   - Admin: admin@criclive.com / admin123
   - Scorer: scorer@criclive.com / scorer123

### ⚠️ Known Issues

1. **Build failing** - Worker crash during static generation (likely memory issue on Windows)
   - Workaround: Use `npm run dev` for development
   - For production, may need to increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`

2. **Some pages need testing** - Scoring flow needs end-to-end testing

### 📁 Key Files Structure

```
src/
├── app/
│   ├── (admin)/admin/     # Admin panel pages
│   ├── (public)/          # Public pages
│   ├── (scorer)/scorer/  # Scorer interface
│   ├── api/               # API routes
│   ├── overlay/           # OBS overlay pages
│   └── login/, register/ # Auth pages
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Navbar, layout components
│   └── providers/        # Auth, Theme providers
└── lib/
    ├── prisma.ts         # Prisma client
    ├── auth.ts            # NextAuth config
    ├── themes.ts          # Theme definitions
    ├── scoring-engine.ts  # Ball calculation logic
    └── socket.ts         # Socket.io client
```

### 🎯 Next Steps

1. Test the complete scoring flow:
   - Create tournament → Add teams → Create match → Setup toss/XI → Start match → Score balls

2. Fix build issue for production deployment

3. Add additional features:
   - Match result entry
   - Player statistics
   - Scorecard PDF export
   - Mobile responsive improvements
