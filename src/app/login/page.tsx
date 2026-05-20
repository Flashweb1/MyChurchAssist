"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { seedDemoData } from "@/lib/demo-seed";
import Image from "next/image";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Forgot password state
  const [view, setView] = useState<"login" | "forgot" | "reset-sent">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const router = useRouter();
  const { user, login, loginWithGoogle, signup, loading: authLoading } = useAuth();
  const isDemoRef = useRef(false);
  const demoSeededRef = useRef(false);

  // Handle navigation after auth state settles
  useEffect(() => {
    if (!user || authLoading) return;

    if (isDemoRef.current && !demoSeededRef.current) {
      // Demo flow: seed data then go to dashboard
      demoSeededRef.current = true;
      seedDemoData(user.displayName || "Demo Admin")
        .catch((err) => console.error("Demo seed error:", err))
        .then(() => new Promise((r) => setTimeout(r, 800))) // Wait for Firestore consistency
        .finally(() => router.push("/dashboard"));
      return;
    }

    // Normal flow: go to onboarding
    router.push("/onboarding");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      switch (code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    isDemoRef.current = true;
    demoSeededRef.current = false;

    const randomId = Math.floor(Math.random() * 100000);
    const demoEmail = `demo_${randomId}@churchassist.app`;
    const demoPass = "demo1234";

    try {
      await signup(demoEmail, demoPass);
      // Auth state change triggers useEffect which seeds data and navigates
    } catch {
      // Fallback: try the standard demo account
      try {
        await login("demo@churchassist.app", "demo1234");
        // Auth state change triggers useEffect which seeds data and navigates
      } catch {
        setError("Demo login failed. Please try again.");
        isDemoRef.current = false;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch {
      setError("Google sign in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setView("reset-sent");
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      switch (fbErr.code) {
        case "auth/user-not-found":
          setResetError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setResetError("Please enter a valid email address.");
          break;
        default:
          setResetError("Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // ── Forgot Password / Reset Sent views ──────────────────────────────────────
  if (view === "forgot" || view === "reset-sent") {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-10 w-auto mx-auto mb-4" priority />
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {view === "reset-sent" ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-[var(--brand-muted)] mb-6">
                  We sent a password reset link to <strong>{resetEmail}</strong>. Check your email and follow the instructions.
                </p>
                <button
                  onClick={() => { setView("login"); setResetEmail(""); setResetError(""); }}
                  className="w-full bg-[var(--brand-blue)] text-white py-3 rounded-2xl font-semibold hover:bg-[#0955db] transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setView("login"); setResetError(""); }}
                  className="flex items-center gap-1.5 text-sm text-[var(--brand-muted)] hover:text-[var(--brand-navy)] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Reset your password</h2>
                <p className="text-sm text-[var(--brand-muted)] mb-6">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {resetError}
                  </div>
                )}
                <form onSubmit={handlePasswordReset} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--brand-navy)]">Email address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all"
                      placeholder="admin@church.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[var(--brand-blue)] hover:bg-[#0955db] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-[var(--brand-blue)]/20"
                  >
                    {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Login view ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-10 w-auto" priority />
          </div>
          <p className="text-slate-400">Sign in to your church management dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Welcome back</h2>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[var(--brand-border)] hover:bg-[var(--brand-bg)] text-[var(--brand-navy)] py-3 rounded-2xl font-medium transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Demo Sign In Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-medium transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Try Demo Account"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--brand-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[var(--brand-muted)]">Or continue with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--brand-navy)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all"
                placeholder="admin@church.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--brand-navy)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--brand-blue)] hover:bg-[#0955db] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[var(--brand-blue)]/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              type="button"
              onClick={() => { setView("forgot"); setResetEmail(email); setResetError(""); }}
              className="text-sm text-[var(--brand-blue)] hover:text-[#0955db] font-medium transition-colors"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-[var(--brand-muted)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--brand-blue)] hover:text-[#0955db] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[var(--brand-muted)] text-xs mt-8">
          Church Assist &mdash; Modern Church Management
        </p>
      </div>
    </div>
  );
}
