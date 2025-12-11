# WartungsWerk

A mobile-first PWA for heating technicians (Heizungsbauer) to manage customer maintenance schedules and automate reminder emails.

## Overview

WartungsWerk helps heating technicians like Max efficiently manage their customer base, track maintenance schedules, and automatically send reminder emails to customers. Built as an offline-first Progressive Web App, it works reliably even without internet connection during on-site visits.

## Features

- **Customer Management**: Store customer details with addresses and contact information
- **Heater Registry**: Track multiple heating systems per customer with model, serial number, and location
- **Maintenance Scheduling**: Log maintenance visits with photos and automatic next-visit calculation
- **Email Automation**: Send automated reminder emails (4 weeks, 1 week, and overdue)
- **GDPR Compliant**: Double opt-in email consent management
- **Offline-First**: Works without internet, syncs when connection returns
- **Mobile-Optimized**: Touch-friendly interface designed for field work

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PWA with Service Workers

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js

### Services
- Supabase (Database + Storage)
- Resend (Email delivery)
- Vercel (Hosting)
- Sentry (Error monitoring)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Accounts: Vercel, Supabase, Resend, Sentry (see Developer Setup Guide)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wartungswerk-app
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see docs/DEVELOPER-SETUP-GUIDE.md for details)

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
wartungswerk-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utilities and helpers
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── ...               # Other utilities
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── public/               # Static assets
│   ├── icons/            # PWA icons
│   └── sw.js             # Service Worker
├── emails/               # React Email templates
├── docs/                 # Planning documentation
│   ├── PROJECT-SUMMARY.md
│   ├── agent-01-mvp-scope-definition.md
│   ├── agent-02-technical-architecture.md
│   ├── agent-04-gdpr-compliance-framework.md
│   └── DEVELOPER-SETUP-GUIDE.md
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database

## Development Workflow

### Sprint 1 (Weeks 1-2): Foundation
- Basic authentication (register, login, logout)
- Database setup with Prisma
- Security hardening
- Basic UI structure

### Sprint 2 (Weeks 3-4): Customer Management
- Customer CRUD operations
- Heater registration
- Basic search and filtering

### Sprint 3 (Weeks 5-6): Maintenance Tracking
- Maintenance logging
- Photo upload
- Calendar view

### Sprint 4 (Weeks 7-8): Email Automation
- Email templates
- Reminder scheduling
- Double opt-in flow

See `docs/agent-01-mvp-scope-definition.md` for detailed sprint plan.

## Documentation

All planning documents are located in the `docs/` folder:

- **PROJECT-SUMMARY.md** - Executive overview and roadmap
- **agent-01-mvp-scope-definition.md** - Feature specs and sprint plan
- **agent-02-technical-architecture.md** - System architecture and API specs
- **agent-04-gdpr-compliance-framework.md** - GDPR compliance requirements
- **DEVELOPER-SETUP-GUIDE.md** - Step-by-step setup instructions

## Environment Variables

Required environment variables (see `.env.example`):

```
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Deploy

Vercel will automatically:
- Deploy on every push to main
- Create preview deployments for PRs
- Run builds and tests

## Security

- All passwords are hashed with bcrypt (10 rounds)
- JWT sessions with NextAuth.js
- CORS protection on API routes
- SQL injection protection via Prisma
- XSS protection with React's auto-escaping
- Rate limiting on auth endpoints (TODO: Sprint 6)

## GDPR Compliance

- Double opt-in required for email marketing
- Unsubscribe link in every email
- Data retention policies implemented
- EU data centers (Supabase Frankfurt region)
- See `docs/agent-04-gdpr-compliance-framework.md` for complete compliance guide

## Contributing

This is currently a single-user MVP project. Contributing guidelines will be added in Phase 2.

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact: [your-email]

## Roadmap

- **Phase 1 (MVP)**: Single-user, offline-first, basic email automation (8 weeks)
- **Phase 2**: Multi-user, team features, advanced reporting (Weeks 9-16)
- **Phase 3**: SaaS platform, marketplace, integrations (Months 5-12)

See `docs/PROJECT-SUMMARY.md` for detailed roadmap.
