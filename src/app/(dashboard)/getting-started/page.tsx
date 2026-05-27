"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Compass, 
  Users, 
  UserPlus, 
  Wallet, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Award
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings-context";

export default function GettingStartedPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]); // Onboarding completed is index 0

  const steps = [
    {
      id: 0,
      title: "Configure Church settings",
      desc: "Customize your address, branches, locale, and currency details.",
      action: "Configured",
      href: "/settings",
      completed: true
    },
    {
      id: 1,
      title: "Add your first member",
      desc: "Populate your congregation directory with names, contacts, and departments.",
      action: "Go to Members",
      href: "/members",
      completed: false
    },
    {
      id: 2,
      title: "Log a first-time newcomer",
      desc: "Keep track of visitors and assign follow-ups so no one falls through the cracks.",
      action: "Log Newcomer",
      href: "/newcomers",
      completed: false
    },
    {
      id: 3,
      title: "Record today's attendance",
      desc: "Track attendance headcount or check in members weekly across all campuses.",
      action: "Take Attendance",
      href: "/attendance",
      completed: false
    },
    {
      id: 4,
      title: "Setup SMS & WhatsApp templates",
      desc: "Fund your communications wallet and configure automated birthday notifications.",
      action: "Manage Wallet",
      href: "/wallet",
      completed: false
    }
  ];

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Admin";

  const toggleStep = (id: number) => {
    if (id === 0) return; // Cannot uncheck onboarding
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children py-4">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome to Church Assist
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Let&apos;s build the future of {settings.churchName || "your church"}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Welcome aboard, {firstName}! We&apos;ve prepared a quick setup checklist and documentation guide to help you master Church Assist.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--brand-blue)] to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all self-start md:self-auto hover:-translate-y-0.5"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Checklist & Quick actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[var(--brand-border)] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--brand-navy)] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[var(--brand-blue)]" />
                  Quick Setup Checklist
                </h2>
                <p className="text-xs text-[var(--brand-muted)] mt-1">Get your workspace fully ready in less than 5 minutes.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-[var(--brand-blue)] rounded-full">
                {completedSteps.length} of {steps.length} completed
              </span>
            </div>

            <div className="divide-y divide-[var(--brand-border-light)]">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div 
                    key={step.id} 
                    className={`flex items-start gap-4 py-4.5 transition-all group ${
                      isCompleted ? "opacity-75" : ""
                    }`}
                  >
                    <button 
                      onClick={() => toggleStep(step.id)}
                      disabled={step.id === 0}
                      className="mt-0.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className={`w-5.5 h-5.5 ${
                        isCompleted 
                          ? "text-emerald-500 fill-emerald-50" 
                          : "text-slate-300 group-hover:text-slate-400"
                      }`} />
                    </button>
                    <div className="flex-1 space-y-1">
                      <h3 className={`text-sm font-semibold transition-all ${
                        isCompleted ? "line-through text-slate-400" : "text-slate-900"
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-[var(--brand-muted)]">{step.desc}</p>
                    </div>
                    {step.href && (
                      <Link 
                        href={step.href} 
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap ${
                          isCompleted
                            ? "bg-slate-50 border-slate-200 text-slate-500 cursor-default pointer-events-none"
                            : "border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white"
                        }`}
                      >
                        {step.action}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Key Features Guide */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[var(--brand-border)] shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-[var(--brand-navy)] flex items-center gap-2 border-b border-[var(--brand-border)] pb-4">
              <BookOpen className="w-5 h-5 text-[var(--brand-blue)]" />
              Feature Guide
            </h2>

            <div className="space-y-4.5">
              {[
                {
                  title: "Automated Birthdays",
                  desc: "Configure standard templates and automatically send sms/emails to members on their birthdays.",
                  icon: Award,
                  color: "text-amber-600 bg-amber-50"
                },
                {
                  title: "AI Message Assistant",
                  desc: "Stuck with drafting outreach or weekly newsletters? Let the AI assistant write custom templates in seconds.",
                  icon: Sparkles,
                  color: "text-purple-600 bg-purple-50"
                },
                {
                  title: "Visitor Journeys",
                  desc: "Newcomers logged in the system get marked for tasks, keeping track of discipleship, visits, and phone status.",
                  icon: UserPlus,
                  color: "text-emerald-600 bg-emerald-50"
                },
                {
                  title: "Financial Audits",
                  desc: "Record tithes and general expenses instantly. Monitor transactions, categories, and wallet balances.",
                  icon: Wallet,
                  color: "text-blue-600 bg-blue-50"
                }
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${feat.color}`}>
                    <feat.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{feat.title}</h4>
                    <p className="text-[11px] text-[var(--brand-muted)] mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* FAQs */}
      <div className="bg-white rounded-3xl border border-[var(--brand-border)] shadow-sm p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900">How do my settings work?</h3>
            <p className="text-xs text-[var(--brand-muted)] leading-relaxed">
              Your settings configure your base local currency, locale timezone, SMS templates, and branches. You can customize them anytime in the settings directory.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900">What is the SMS Wallet?</h3>
            <p className="text-xs text-[var(--brand-muted)] leading-relaxed">
              Your Wallet holds the credits used to send automated messages, email campaigns, and prayer requests. You can fund the wallet by going to the Wallet screen in the sidebar.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900">Are my members secure?</h3>
            <p className="text-xs text-[var(--brand-muted)] leading-relaxed">
              Yes, data security is enforced at the database level. Church Assist is fully multi-tenant, so your members, attendance sheets, and financial records are completely sandboxed to your specific church ID.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900">How do I add a new branch/campus?</h3>
            <p className="text-xs text-[var(--brand-muted)] leading-relaxed">
              Navigate to Settings &gt; Branches, input the branch name, and click Add. You can then tag members or attendance records to that specific branch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
