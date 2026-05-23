# Church Assist

Church Assist is a modern church management system built with Next.js, Firebase, and AI-assisted ministry tools. It helps churches manage attendance, follow-ups, communications, finance insights, and newcomer care from a unified dashboard.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```powershell
copy .env.example .env.local
```

3. Fill in the required Firebase and AI environment variables in `.env.local`.

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — build the production app
- `npm run start` — start the production server after build
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript type checking

## Required environment variables

### Client-side Firebase configuration

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_APP_URL` (optional, recommended for AI provider headers)

### Server-side credentials and API keys

- `FIREBASE_PROJECT_ID` (optional; falls back to `NEXT_PUBLIC_FIREBASE_PROJECT_ID`)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENROUTER_API_KEY`
- `OPENCODE_API_KEY`

## Notes

- `src/lib/firebase.ts` validates required client Firebase config values.
- `src/lib/firebase-admin.ts` initializes Firebase Admin SDK with server-side credentials.
- `src/app/api/ai/route.ts` uses OpenRouter and OpenCode providers for AI generation.

## Deployment

This app is ready for deployment to platforms supporting Next.js and server-side environment variables, such as Vercel or Netlify.
