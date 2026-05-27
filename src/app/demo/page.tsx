"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { seedDemoData } from "@/lib/demo-seed";
import { CheckCircle2, Loader2, UserPlus, DatabaseIcon, LayoutDashboard, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DEMO_PASSWORD = "demo1234";
const FALLBACK_EMAIL = "demo@churchassist.app";
const SEED_TIMEOUT = 30000;

type Step = "account" | "data" | "ready";
type StepStatus = "waiting" | "active" | "done" | "error";

const STEPS: { id: Step; label: string; sublabel: string; icon: React.ElementType }[] = [
  { id: "account", label: "Creating demo account", sublabel: "Setting up your secure session", icon: UserPlus },
  { id: "data",    label: "Populating church data", sublabel: "Members, finances, attendance & more", icon: DatabaseIcon },
  { id: "ready",   label: "Dashboard ready!", sublabel: "Redirecting you now...", icon: LayoutDashboard },
];

export default function DemoPage() {
  const router = useRouter();
  const { user, login, signup, loading: authLoading, churchId, refreshProfile } = useAuth();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [currentStep, setCurrentStep] = useState<Step>("account");
  const [stepStatuses, setStepStatuses] = useState<Record<Step, StepStatus>>({
    account: "active",
    data: "waiting",
    ready: "waiting",
  });
  const [error, setError] = useState("");
  const seedInitializedRef = useRef(false);

  const setStep = (step: Step, stepStatus: StepStatus) => {
    setCurrentStep(step);
    setStepStatuses((prev) => ({ ...prev, [step]: stepStatus }));
  };

  const advanceStep = (done: Step, next: Step) => {
    setStepStatuses((prev) => ({ ...prev, [done]: "done", [next]: "active" }));
    setCurrentStep(next);
  };

  const seedAndNavigate = async (targetId: string, displayName?: string, email?: string) => {
    advanceStep("account", "data");
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Demo setup timed out. Check your connection.")), SEED_TIMEOUT)
      );
      await Promise.race([
        seedDemoData(displayName || "Demo Admin", targetId, email, displayName),
        timeoutPromise,
      ]);
      await refreshProfile();
      advanceStep("data", "ready");
      setStatus("success");
      // Small delay so the user sees "Dashboard ready!" before redirect
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      console.error("Demo seed error:", err);
      setError(err instanceof Error ? err.message : "Demo initialization failed. Please try again.");
      setStep(currentStep, "error");
      setStatus("failed");
    }
  };

  const isDemoUser = user?.email?.startsWith("demo_") || user?.email === FALLBACK_EMAIL;

  // Step 1 — create / login as a demo user
  useEffect(() => {
    if (status !== "idle") return;
    if (user && !isDemoUser) return;

    const startDemo = async () => {
      setStatus("pending");
      setError("");
      setStep("account", "active");

      try {
        const randomId = Math.floor(Math.random() * 100000);
        const demoEmail = `demo_${randomId}@churchassist.app`;
        await signup(demoEmail, DEMO_PASSWORD);
      } catch {
        try {
          await login(FALLBACK_EMAIL, DEMO_PASSWORD);
        } catch {
          setError("Could not start demo. Please check your connection and try again.");
          setStep("account", "error");
          setStatus("failed");
        }
      }
    };

    startDemo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Step 2 — once auth is ready, seed Firestore
  useEffect(() => {
    if (status !== "pending") return;
    if (!user || authLoading) return;
    if (seedInitializedRef.current) return;

    seedInitializedRef.current = true;
    const targetId = churchId || user.uid;
    const displayName = user.displayName || "Demo Admin";
    const email = user.email || FALLBACK_EMAIL;

    seedAndNavigate(targetId, displayName, email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user, authLoading, churchId]);

  // If already a fully-onboarded non-demo user, redirect
  useEffect(() => {
    if (user && !authLoading && status === "idle" && !isDemoUser) {
      router.push("/dashboard");
    }
  }, [user, authLoading, status, isDemoUser, router]);

  const handleRetry = () => {
    seedInitializedRef.current = false;
    setError("");
    setStatus("idle");
    setStepStatuses({ account: "active", data: "waiting", ready: "waiting" });
    setCurrentStep("account");
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src="/logo-church-assist.png"
            alt="Church Assist"
            width={2000}
            height={581}
            className="h-10 w-auto mx-auto"
            priority
          />
          <h1 className="text-2xl font-bold text-white mt-6">Preparing your demo&hellip;</h1>
          <p className="text-sm text-slate-400 mt-2">
            No signup required &mdash; your sample dashboard will be ready in seconds.
          </p>
        </div>

        {/* Progress Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl space-y-6">
          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map(({ id, label, sublabel, icon: Icon }) => {
              const s = stepStatuses[id];
              const isActive = s === "active";
              const isDone = s === "done";
              const isError = s === "error";
              const isWaiting = s === "waiting";

              return (
                <div
                  key={id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                    isActive ? "bg-slate-800/80 border border-slate-700" :
                    isDone ? "bg-emerald-900/20 border border-emerald-800/40" :
                    isError ? "bg-red-900/20 border border-red-800/40" :
                    "bg-slate-900/30 border border-slate-800/40 opacity-40"
                  }`}
                >
                  {/* Icon / Spinner / Check */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive ? "bg-[var(--brand-blue)]/20" :
                    isDone ? "bg-emerald-500/20" :
                    isError ? "bg-red-500/20" :
                    "bg-slate-800"
                  }`}>
                    {isActive && <Loader2 className="w-5 h-5 animate-spin text-[var(--brand-blue)]" />}
                    {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {isWaiting && <Icon className="w-5 h-5 text-slate-500" />}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-colors ${
                      isActive ? "text-white" :
                      isDone ? "text-emerald-300" :
                      isError ? "text-red-300" :
                      "text-slate-500"
                    }`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 transition-colors ${
                      isActive ? "text-slate-400" :
                      isDone ? "text-emerald-400/70" :
                      isError ? "text-red-400/70" :
                      "text-slate-600"
                    }`}>
                      {sublabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          {status !== "failed" && (
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{
                  width:
                    stepStatuses.ready === "done" ? "100%" :
                    stepStatuses.data === "active" ? "66%" :
                    stepStatuses.account === "active" ? "15%" :
                    "0%",
                }}
              />
            </div>
          )}

          {/* Error state */}
          {status === "failed" && (
            <div className="space-y-3">
              {error && (
                <p className="text-sm text-red-300 text-center bg-red-900/20 rounded-xl px-4 py-3 border border-red-800/40">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="w-full rounded-2xl bg-[var(--brand-blue)] px-4 py-3 text-white font-semibold hover:bg-[#0955db] transition-colors"
              >
                Retry Demo
              </button>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Demo data is for preview only &mdash; your real church data stays private.
        </p>
      </div>
    </div>
  );
}
