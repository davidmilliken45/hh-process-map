# HH Process Map Dashboard

Interactive business process mapping application for visualizing, tracking, and managing Horizon Homes business processes with health status monitoring and collaborative features.

## 🎯 Overview

The Process Map Dashboard provides a visual, interactive way to manage your business processes:

- **Health Status Monitoring** - Real-time tracking of each process component's performance
- **Metrics Tracking** - Monitor KPIs with current vs. target values
- **Collaborative Features** - Todos, issues, ideas, and comments for each process step
- **Activity Logging** - Complete audit trail of all changes
- **Weekly Snapshots** - Historical comparison and trend analysis
- **Role-Based Access** - Admin, Manager, and Viewer permissions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your application URL (http://localhost:3000 for dev)

3. **Initialize the database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Default Login Credentials

After seeding, you can log in with:

- **Email:** `david@horizonhomes.com`
- **Password:** `password123`
- **Role:** Admin

Other accounts:
- `kristie@horizonhomes.com` (Manager)
- `cody@horizonhomes.com` (Manager)

## 📊 Features

### Dashboard
- Overall business health score (0-100)
- Component breakdown by health status
- Active todos, open issues, and ideas counts
- Recent activity feed
- Visual health distribution chart

### Process Map
- Interactive canvas with component cards
- Organized by business sections:
  - Lead Generation
  - Sales & Estimation
  - Production & Installation
  - Post-Install & Service
- Filter by health status, owner, or section
- Search components by name
- Click any component for detailed view

### Component Details
- Complete component information
- Metrics with current vs. target values
- Tabbed interface for:
  - **Todos** - Track action items with assignees and due dates
  - **Issues** - Report and resolve problems with priority levels
  - **Ideas** - Collect improvement suggestions with voting
  - **Comments** - Team discussions and updates

### Health Status System
- 🟢 **GREEN:** Performing at or above target
- 🟡 **YELLOW:** Below target but not critical
- 🔴 **RED:** Significantly below target, needs immediate action
- ⚪ **GRAY:** Not started or planned
- 🔵 **BLUE:** In progress or testing

## 🛠️ Technology Stack

- **Frontend:** Next.js 15.5, React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui components
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with JWT
- **Charts:** Recharts
- **Icons:** Lucide React

## 📁 Project Structure

```
hh-process-map/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── components/      # Component CRUD
│   │   ├── todos/           # Todo management
│   │   ├── issues/          # Issue tracking
│   │   ├── ideas/           # Idea collection
│   │   ├── metrics/         # Metrics management
│   │   ├── comments/        # Comments
│   │   ├── sections/        # Section management
│   │   ├── snapshots/       # Weekly snapshots
│   │   └── activity/        # Activity log
│   ├── login/               # Login page
│   ├── process-map/         # Process map view
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Header, Sidebar, AppLayout
│   ├── process-map/         # Process map components
│   └── providers/           # Context providers
├── lib/
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript types
└── prisma/
    ├── schema.prisma       # Database schema
    └── seed.ts             # Initial data
```

## 🔑 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with initial data
npm run prisma:studio    # Open Prisma Studio
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User** - Team members with role-based permissions
- **Section** - Business process sections (Lead Gen, Sales, etc.)
- **Component** - Individual process steps with health status
- **Metric** - KPIs for each component
- **Todo** - Action items with assignees
- **Issue** - Problems to resolve with priorities
- **Idea** - Improvement suggestions with voting
- **Comment** - Team discussions
- **Connection** - Links between components showing data flow
- **ActivityLog** - Audit trail of all changes
- **Snapshot** - Weekly state captures for trending

## 🔐 Authentication & Authorization

### Roles

- **ADMIN** - Full access to all features and settings
- **MANAGER** - Can create, edit, and delete content
- **VIEWER** - Read-only access to all data

### Permissions

- Viewers cannot create, edit, or delete any data
- Users can only edit their own comments
- All mutations are logged to the activity log

## 🎨 UI Components

Built with shadcn/ui for consistency and accessibility:

- Button, Card, Input, Label, Textarea
- Select, Dialog, Dropdown Menu, Badge, Tabs
- All components are fully typed and accessible
- Dark mode support via CSS custom properties
- Responsive design for mobile and desktop

## 📈 Health Calculation

Components are automatically assigned health status based on metrics:

- **GREEN:** ≥90% of metrics meet or exceed targets
- **YELLOW:** 70-89% of metrics meet targets
- **RED:** <70% of metrics meet targets
- **GRAY:** No metrics defined yet
- **BLUE:** Manually set for in-progress items

Overall dashboard health score is calculated using weighted values:
- GREEN = 100 points
- BLUE = 70 points
- YELLOW = 60 points
- GRAY = 50 points
- RED = 20 points

## 🚢 Deployment

### Railway Deployment

1. Create new Railway project
2. Add PostgreSQL database
3. Set environment variables in Railway
4. Deploy from GitHub repository
5. Run migrations: `npx prisma migrate deploy`
6. Seed database: `npx prisma db seed`

### Environment Variables for Production

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-new-secret"
```

## 🔄 Data Management

### Creating Snapshots

Snapshots capture the complete state of all components for historical comparison:

```bash
curl -X POST http://localhost:3000/api/snapshots \
  -H "Content-Type: application/json" \
  -d '{"name": "Week of Oct 14, 2025"}'
```

### Exporting Data

All API endpoints return JSON that can be exported for backup or analysis.

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Commit with descriptive message
4. Push and create pull request

## 📝 License

Proprietary - Horizon Homes Internal Use Only

## 🆘 Support

For issues or questions, contact the development team or create an issue in the repository.

## 🎯 Roadmap

Future enhancements planned:

- [ ] Drag-and-drop component positioning
- [ ] Real-time collaboration with WebSockets
- [ ] Email notifications for critical issues
- [ ] Mobile app (React Native)
- [ ] Twenty CRM API integration
- [ ] n8n webhook automation
- [ ] Advanced reporting and analytics
- [ ] Bulk operations for todos/issues
- [ ] Custom dashboard views per user
- [ ] PDF export of process maps

## 🏗️ Architecture

The application follows Next.js 15 App Router patterns:

- **Server Components** - Default for pages, fetch data on server
- **Client Components** - Used for interactive UI (forms, modals)
- **API Routes** - RESTful endpoints with proper auth
- **Prisma ORM** - Type-safe database access
- **NextAuth** - Secure authentication with JWT

All routes are protected and require authentication. Role-based access control is enforced at both the API and UI levels.

---

Built with ❤️ for Horizon Homes process improvement.
