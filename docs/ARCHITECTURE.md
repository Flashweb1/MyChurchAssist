# Church Assist — Architecture Overview

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Framework          | Next.js 16 (App Router)                     |
| Language           | TypeScript 5                                |
| Styling            | Tailwind CSS 4 + CSS custom properties      |
| Database           | Firebase Firestore                          |
| Auth               | Firebase Auth (email/password + Google)     |
| AI                 | OpenRouter + OpenCode API (Gemma, Nemotron) |
| Email              | Resend                                      |
| SMS                | Termii                                      |
| WhatsApp           | Twilio                                      |
| i18n               | i18next + react-i18next                     |
| Charts             | Recharts                                    |
| PDF                | jsPDF + jspdf-autotable                     |
| CSV Parsing        | PapaParse                                   |
| QR Code            | react-qr-code                               |
| Toast Notifications| Sonner                                      |
| Markdown           | react-markdown + remark-gfm                 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Authenticated dashboard routes (grouped)
│   │   ├── attendance/
│   │   ├── dashboard/
│   │   ├── departments/
│   │   ├── finances/
│   │   ├── follow-up/
│   │   ├── getting-started/
│   │   ├── members/
│   │   ├── messages/
│   │   ├── newcomers/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── wallet/
│   ├── (onboarding)/       # Onboarding flow (grouped)
│   │   └── onboarding/
│   ├── api/                # Route handlers
│   │   ├── ai/             # AI chat completion
│   │   └── messages/       # Mass message sending
│   ├── benefits/
│   ├── contact/
│   ├── features/
│   ├── login/
│   ├── pricing/
│   ├── privacy-policy/
│   ├── signup/
│   ├── terms-of-service/
│   ├── testimonials/
│   ├── layout.tsx          # Root layout (providers)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles + design tokens
│   ├── error.tsx           # Error boundary
│   ├── loading.tsx         # Loading state
│   └── not-found.tsx       # 404 page
├── components/             # Shared React components
│   ├── AttendanceChart.tsx
│   ├── ConfirmModal.tsx
│   ├── DemoFloatingBadge.tsx
│   ├── DemoLink.tsx
│   ├── FloatingWhatsApp.tsx
│   ├── Header.tsx
│   ├── LanguageSwitcher.tsx
│   ├── MemberBulkUpload.tsx
│   ├── PublicFooter.tsx
│   ├── PublicNavbar.tsx
│   └── Sidebar.tsx
├── lib/                    # Utilities, hooks, config
│   ├── auth.tsx            # Auth context + provider
│   ├── auth-middleware.ts  # Server-side role verification
│   ├── currency.ts         # Currency formatting + countries
│   ├── demo-seed.ts        # Demo data seeding
│   ├── email.ts            # Resend email integration
│   ├── firebase.ts         # Client Firebase init
│   ├── firebase-admin.ts   # Server Firebase Admin init
│   ├── geo.ts              # Country/locale detection
│   ├── i18n/               # Internationalization
│   ├── roles.ts            # Role-based permissions
│   ├── settings-context.tsx# Church settings context
│   ├── sms.ts              # Termii SMS integration
│   ├── types.ts            # TypeScript interfaces
│   └── whatsapp.ts         # Twilio WhatsApp integration
└── __tests__/              # Jest test suite
    ├── currency.test.ts
    ├── geo.test.ts
    ├── LanguageSwitcher.test.tsx
    └── sms.test.ts
```

## Routing Architecture

- **Public routes**: `/`, `/features`, `/pricing`, `/benefits`, `/testimonials`, `/contact`, `/privacy-policy`, `/terms-of-service`
- **Auth routes**: `/login`, `/signup`
- **Dashboard routes** (grouped under `(dashboard)/`): require authentication
- **Onboarding routes** (grouped under `(onboarding)/`): post-signup setup

## Data Flow

```
User → Browser → Next.js Server → API Routes / Firebase Client SDK
                                        ↓
                              Firestore Database
                                        ↓
                              Firebase Admin SDK (server-side only)
```

### Auth Flow
1. User logs in via Firebase Auth (email/password or Google)
2. `onAuthStateChanged` listener in `AuthProvider` updates context
3. `AuthProvider` fetches user profile from Firestore `users/{uid}`
4. Session cookie set for middleware-aware protection
5. Server API routes use `requireRole` middleware with `firebase-admin` ID token verification

### AI Flow
1. User submits prompt from AI Assistant UI
2. POST to `/api/ai` with `{ prompt, messages }`
3. Server iterates through configured AI providers (OpenRouter / OpenCode)
4. Returns first successful response or error

## Key Design Decisions

### 1. Role-Based Access Control
- 5 roles: `super_admin`, `admin`, `editor`, `finance`, `viewer`
- `ROLE_HIERARCHY` numeric levels for minimum-role checks
- `PAGE_PERMISSIONS` dictionary for CRUD-level access per page
- Enforced both client-side (UI hiding) and server-side (`requireRole`)

### 2. Multi-Tenancy via churchId
- Every document includes a `churchId` field
- Firestore security rules enforce per-church access isolation
- `churchId` defaults to the user's UID on first signup

### 3. i18n
- 4 languages: English, French, Spanish, Portuguese
- Language detection via browser navigator.language
- Persisted via i18next-browser-languagedetector

### 4. Demo Mode
- Creates a temporary Firebase account with random email
- Seeds 12 data collections with realistic sample data
- One-click "Try Demo" button on signup page

## Firestore Database Schema

### Collections

| Collection            | Key Fields                                      |
| --------------------- | ----------------------------------------------- |
| `users/{uid}`         | uid, churchId, email, displayName, role, status |
| `settings/{churchId}` | churchName, branches, currency, locale, timezone|
| `members/{docId}`     | churchId, fullName, phone, email, branch, status|
| `newcomers/{docId}`   | churchId, fullName, visitDate, status           |
| `attendance/{docId}`  | churchId, date, service, branch, mode, total    |
| `followups/{docId}`   | churchId, personName, type, status, assignedTo  |
| `departments/{docId}` | churchId, name, head, memberCount, status       |
| `transactions/{docId}`| churchId, amount, category, type, paymentMethod |
| `messages/{docId}`    | churchId, title, content, type, audience        |
| `wallets/{churchId}`  | churchId, balance, totalFunded, totalSpent      |
| `wallet_transactions` | churchId, type, status, amount, reference       |
| `invitations/{id}`    | churchId, email, role, status                   |
| `message_deliveries`  | churchId, messageId, channel, status, cost      |
| `birthday_config`     | churchId, enabled, template, channel, sendTime  |

## Security

- **Firestore Rules**: Per-document `churchId` matching + auth checks
- **API Routes**: Rate-limiting-ready, role-based middleware
- **Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy enforced via Next.js config
- **Admin SDK**: Server-only initialization, private key stored in env vars

## Deployment

- Platform: Netlify (with `@netlify/plugin-nextjs`)
- Build: `npm run build`
- Node version: 20
- Environment: All variables from `.env.example` must be populated in production
