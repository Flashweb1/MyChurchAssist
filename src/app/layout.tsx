import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import I18nProvider from "@/lib/i18n/provider";
import { DarkModeProvider } from "@/lib/dark-mode-context";

export const metadata = {
  title: "Church Assist",
  description: "Modern church management system built for congregations",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans min-h-screen antialiased bg-[var(--brand-bg)] text-[var(--brand-navy)]" suppressHydrationWarning>
        <DarkModeProvider>
          <I18nProvider>
            <AuthProvider>
              <Toaster richColors position="top-right" />
              <FloatingWhatsApp />
              {children}
            </AuthProvider>
          </I18nProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
