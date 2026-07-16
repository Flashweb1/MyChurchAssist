import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      Sentry.browserTracingIntegration(),
    ],
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        return null;
      }
      return event;
    },
  });
}
