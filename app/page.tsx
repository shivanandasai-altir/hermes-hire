"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  Bot,
} from "lucide-react";
import { AnimatedFeatures } from "@/components/animated-features";

const ROLE_FLOW = [
  {
    role: "HR",
    action: "Creates jobs, adds candidates, AI summaries",
    gradient: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    role: "Interviewer",
    action: "AI questions, feedback, voice interviews",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    role: "Manager",
    action: "Reviews, decides: hire or reject",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];



const TECH_STACK = [
  "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui",
  "Prisma", "Neon", "PostgreSQL", "Hermes Agent",
  "Vapi", "gog CLI", "TanStack Query", "Vercel",
];

function FloatingDots() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${12 + Math.random() * 20}s`,
    animationDelay: `${Math.random() * 15}s`,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="hermes-dots">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="hermes-dot"
          style={{
            left: dot.left,
            width: dot.size,
            height: dot.size,
            animationDuration: dot.animationDuration,
            animationDelay: dot.animationDelay,
          }}
        />
      ))}
    </div>
  );
}

function HermesLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="1.5" className="text-gold" />
      <path d="M10 10h4l4 6 4-6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" />
      <path d="M10 22V16l6 6V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" opacity="0.6"/>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="hermes-bg relative min-h-screen flex flex-col overflow-hidden">
      <FloatingDots />
      <div className="hermes-glow-1" />
      <div className="hermes-glow-2" />

      {/* ─── NAV ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-gold"><HermesLogo /></span>
          <span className="font-semibold text-[var(--cream)] text-lg tracking-tight">HermesHire</span>
        </div>
        <Link
          href="/login"
          className="hermes-btn text-sm py-2.5 px-5"
        >
          Get Started
          <ArrowRight className="size-3.5" />
        </Link>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-12 max-w-5xl mx-auto w-full">
        <div className="hermes-reveal hermes-reveal-d1">
          <span className="hermes-badge text-xs tracking-widest uppercase mb-6">
            <Sparkles className="size-3" />
            Hackathon MVP · ~3 hour build
          </span>
        </div>

        <h1 className="hermes-reveal hermes-reveal-d2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 72" }}>
          <span className="hermes-underline hermes-gradient-text">HermesHire</span>
        </h1>

        <p className="hermes-reveal hermes-reveal-d3 text-xl sm:text-2xl text-[var(--cream)]/80 max-w-2xl font-light leading-relaxed">
          Autonomous AI hiring copilot — <br className="sm:hidden" />
          <span className="text-[var(--gold)]">AI-powered collaborative hiring workflow platform</span>
        </p>

        <p className="hermes-reveal hermes-reveal-d4 text-[var(--cream)]/50 max-w-xl mt-4 text-sm leading-relaxed">
          HR creates jobs and adds candidates. Interviewers generate AI questions and submit feedback.
          Managers review, decide, and schedule Google Meet calls — all in one place.
        </p>

        <div className="hermes-reveal hermes-reveal-d5 flex flex-col sm:flex-row gap-4 mt-10">
          <Link href="/login" className="hermes-btn text-base py-3.5 px-8">
            Start Hiring
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="hermes-btn hermes-btn-secondary text-base py-3.5 px-8">
            <Bot className="size-4" />
            Demo as Manager
          </Link>
        </div>
      </section>

      {/* ─── ROLE FLOW ─── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="hermes-reveal hermes-reveal-d6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4">
            {ROLE_FLOW.map((item, i) => (
              <div key={item.role} className="flex-1 w-full">
                <div
                  className={`hermes-card p-6 text-center ${item.gradient} ${item.border}`}
                >
                  <div className={`text-2xl font-bold mb-1 ${item.iconColor}`}
                       style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
                    {item.role}
                  </div>
                  <p className="text-xs text-[var(--cream)]/60 leading-relaxed mt-2">
                    {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="hermes-separator mb-16" />
        <h2 className="hermes-reveal hermes-reveal-d1 text-center text-3xl sm:text-4xl font-light mb-4 text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
          Everything you need to hire
        </h2>
        <p className="hermes-reveal hermes-reveal-d2 text-center text-[var(--cream)]/50 text-sm mb-14 max-w-lg mx-auto">
          AI-assisted candidate summaries, interview questions, feedback analysis,
          decision support, and transparent hiring history.
        </p>

        <AnimatedFeatures />
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto w-full">
        <div className="hermes-separator mb-16" />
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-[var(--cream)]/30 mb-8">
          Built with
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {TECH_STACK.map((tech) => (
            <span key={tech} className="hermes-pill">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 px-6 py-20 max-w-3xl mx-auto w-full text-center">
        <div className="hermes-card p-10 sm:p-14 border-[var(--gold-soft)]" style={{ background: "var(--bg-elevated)" }}>
          <h2 className="text-3xl sm:text-4xl font-light mb-4 text-[var(--cream)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
            Ready to ship?
          </h2>
          <p className="text-[var(--cream)]/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Clone the repo, set up Neon + Vercel, and deploy in minutes.
            Built to ship in ~3 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="hermes-btn text-base py-3.5 px-8">
              Get Started
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 px-6 py-10 mt-auto">
        <div className="hermes-separator mb-8" />
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--cream)]/30 text-xs">
            <span className="text-[var(--gold)]"><HermesLogo /></span>
            HermesHire · <span className="font-mono">v0.1.0</span>
          </div>
          <div className="flex gap-6 text-xs text-[var(--cream)]/30">
            <span>Built with Hermes Agent</span>
            <span>Hackathon MVP</span>
            <span>~3 hour build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
