# DevTrack

A full-stack project management system for software development teams, built with Next.js 15, Prisma, and TypeScript.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  Next.js App Router (RSC + Client Components)       │
│  TanStack Query · Zustand · dnd-kit                 │
└──────────────┬────────────────────────────┬─────────┘
               │ Server Actions             │ SSE / REST
               ▼                            ▼
┌─────────────────────────────────────────────────────┐
│               Next.js Server                        │
│  Auth: NextAuth v5 (JWT, GitHub OAuth, Credentials) │
│  Actions: Zod-validated server mutations            │
│  API Routes: SSE stream, GitHub webhooks, cron      │
│  Email: Resend SDK                                  │
└──────────────┬──────────────────────────────────────┘
               │ Prisma ORM
               ▼
┌─────────────────────────────────────────────────────┐
│                  PostgreSQL                         │
└─────────────────────────────────────────────────────┘
```

## Features

| Feature | Status |
|---|---|
| GitHub OAuth + credential auth | ✅ |
| Multi-tenant workspaces | ✅ |
| Project + Issue CRUD | ✅ |
| Kanban board (dnd-kit) | ✅ |
| Sprint management + burndown | ✅ |
| GitHub webhook integration | ✅ |
| Code review aggregator | ✅ |
| Time tracking | ✅ |
| Real-time updates (SSE) | ✅ |
| In-app notifications | ✅ |
| Email notifications (Resend) | ✅ |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### 1. Clone and install

```bash
git clone https://github.com/your-org/devtrack.git
cd devtrack
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### 3. Start Postgres

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` and MailHog (email preview) on `localhost:8025`.

### 4. Run migrations and seed

```bash
npm run db:migrate    # apply schema migrations
npm run db:seed       # create sample workspace, users, issues
```

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Seed credentials:**
- `alice@example.com` / `Password123!` — Owner
- `bob@example.com` / `Password123!` — Member  
- `carol@example.com` / `Password123!` — Member

Workspace slug: `acme`

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret for GitHub webhook verification |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used in emails) |
| `CRON_SECRET` | Bearer token to protect cron endpoints |

## GitHub OAuth Setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
3. Copy **Client ID** and **Client Secret** into `.env`

## GitHub Webhooks

The webhook receiver is at `/api/webhooks/github`.

It handles:
- `push` — indexes commits, links to issues via `Fixes DEV-42` patterns
- `pull_request` — creates/updates PR records, links to issues
- `pull_request_review` — updates reviewer status

Issue linking patterns recognized:
- `Fixes DEV-42`, `Closes FE-7`, `Resolves BE-100` — links **and** closes on merge
- `DEV-42`, `References BE-7` — links only

## Cron Jobs

| Endpoint | Schedule | Description |
|---|---|---|
| `GET /api/cron/burndown-snapshot` | Daily | Captures story point totals for burndown charts |

Protect with `Authorization: Bearer $CRON_SECRET`.

**Vercel cron** (`vercel.json`):
```json
{
  "crons": [{ "path": "/api/cron/burndown-snapshot", "schedule": "0 1 * * *" }]
}
```

## Development

```bash
npm run dev          # start dev server
npm run type-check   # TypeScript strict check
npm run lint         # ESLint
npm run test         # Vitest (unit tests)
npm run db:studio    # Prisma Studio GUI
```

## Testing

Tests live in `/tests/` and use Vitest with a mocked Prisma client:

```
tests/
├── actions/
│   └── issues.test.ts         # Server Action validation + auth
├── utils/
│   ├── issue-linker.test.ts   # GitHub commit message parsing
│   └── issue-state-machine.test.ts  # Sprint state transitions
└── webhooks/
    └── github-handler.test.ts # Webhook event routing
```

Run: `npm run test`

## Production Build

```bash
docker build -t devtrack .
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  devtrack
```

Or deploy to Vercel:

```bash
npm install -g vercel
vercel
```

## Project Structure

```
app/
├── (auth)/              # Sign-in, sign-up, error pages
├── (dashboard)/         # Protected dashboard routes
│   └── [workspace]/     # Workspace-scoped pages
│       └── projects/
│           └── [projectId]/
│               ├── board/    # Kanban board
│               ├── issues/   # Issue list + detail
│               ├── sprints/  # Sprint management
│               └── reviews/  # PR review aggregator
├── api/
│   ├── auth/            # NextAuth handlers
│   ├── sse/             # Real-time event stream
│   ├── webhooks/github/ # GitHub webhook receiver
│   ├── notifications/   # Notification API
│   └── cron/            # Background jobs
└── onboarding/          # Workspace creation flow

lib/
├── actions/             # Server Actions (Zod-validated)
├── auth/                # NextAuth configuration
├── db/                  # Prisma client + typed queries
├── github/              # Octokit, webhook handler, issue linker
├── sse/                 # SSE manager + event types
├── email/               # Resend client
├── shiki/               # Code syntax highlighting
├── utils/               # cn, format, colors, issue-number
└── validations/         # Zod schemas

components/
├── ui/                  # shadcn/ui primitives
├── auth/                # Sign-in/up forms
├── board/               # Kanban components (dnd-kit)
├── issues/              # Issue list, detail, form
├── sprints/             # Sprint list, burndown chart
├── reviews/             # PR review components
├── notifications/       # Bell, list, item
├── time-tracking/       # Timer widget
├── editor/              # Markdown editor/renderer
├── comments/            # Comment thread
├── layout/              # App shell, sidebar, header
└── providers/           # React context providers

store/                   # Zustand stores
hooks/                   # TanStack Query hooks
tests/                   # Vitest test suite
prisma/
├── schema.prisma        # Complete data model
└── seed.ts              # Sample data
```
