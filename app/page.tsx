"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  Terminal as TerminalIcon,
  Mic,
  Users,
  Phone,
  Brain,
  Copy,
} from "lucide-react";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";
import { useState } from "react";

const CLI_FEATURES = [
  {
    icon: TerminalIcon,
    title: "One-Curl Install",
    desc: "curl -fsSL https://hermeshire.sh/install.sh | bash — installed in 10 seconds. No Docker, no database, no setup.",
  },
  {
    icon: Mic,
    title: "Voice-to-Command",
    desc: "Say 'add rahul as candidate' — Hermes translates it to the exact CLI command and executes it. No syntax to remember.",
  },
  {
    icon: Users,
    title: "Role Switching",
    desc: "`hermes auth --as alice` → HR. `hermes auth --as bob` → Interviewer. `hermes auth --as carol` → Manager. Same terminal, three perspectives.",
  },
  {
    icon: Brain,
    title: "AI Features Built In",
    desc: "`hermes candidate summary 1` → AI analyzes resume. `hermes candidate questions 1` → AI generates interview questions. All powered by Hermes-4-70B.",
  },
  {
    icon: Phone,
    title: "Live Phone Interviews",
    desc: "`hermes interview voice 1 --phone \"+1-555...\"` — Vapi AI agent calls the candidate, conducts the interview, returns structured feedback.",
  },
  {
    icon: Copy,
    title: "Candidate Onboarding Links",
    desc: "`hermes candidate invite --job 1 --name \"Jane\"` → generates a shareable link. Candidate opens it in a browser, fills in their resume.",
  },
];

const TECH_STACK = [
  "Node.js", "TypeScript", "Prisma", "Neon PostgreSQL",
  "Hermes-4-70B", "Vapi", "gog CLI", "Commander.js",
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

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText('curl -fsSL https://hermeshire.sh/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-3 bg-black/40 border border-white/[0.08] rounded-xl px-5 py-3.5 font-mono text-sm">
      <span className="text-[var(--gold)]">$</span>
      <code className="text-[var(--cream)]/90">curl -fsSL https://hermeshire.sh/install.sh | bash</code>
      <button
        onClick={copyToClipboard}
        className="text-[var(--cream)]/30 hover:text-[var(--gold)] transition-colors"
      >
        {copied ? <span className="text-green-400 text-xs">Copied!</span> : <Copy className="size-4" />}
      </button>
    </div>
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
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex text-xs text-[var(--cream)]/30 font-mono">v0.1.0 · CLI</span>
          <Link href="/login" className="hermes-btn text-sm py-2.5 px-5">
            Demo
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12 max-w-5xl mx-auto w-full">
        <div className="hermes-reveal hermes-reveal-d1">
          <span className="hermes-badge text-xs tracking-widest uppercase mb-6">
            <Sparkles className="size-3" />
            Hackathon MVP · One-command install
          </span>
        </div>

        <h1 className="hermes-reveal hermes-reveal-d2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 72" }}>
          <span className="hermes-underline hermes-gradient-text">HermesHire</span>
        </h1>

        <p className="hermes-reveal hermes-reveal-d3 text-xl sm:text-2xl text-[var(--cream)]/80 max-w-2xl font-light leading-relaxed mb-2">
          Autonomous AI hiring copilot — <br className="sm:hidden" />
          <span className="text-[var(--gold)]">in your terminal</span>
        </p>

        <p className="hermes-reveal hermes-reveal-d4 text-[var(--cream)]/50 max-w-lg mt-3 text-sm leading-relaxed">
          One curl command. No database setup. No browser tabs. 
          Type natural language or speak it — Hermes handles the rest.
        </p>

        {/* ─── INSTALL COMMAND ─── */}
        <div className="hermes-reveal hermes-reveal-d5 mt-10 mb-4">
          <InstallCommand />
        </div>

        <div className="hermes-reveal hermes-reveal-d5 flex flex-col sm:flex-row gap-4 mt-6">
          <Link href="/login" className="hermes-btn text-base py-3.5 px-8">
            Try the Demo
            <ChevronRight className="size-4" />
          </Link>
          <Link href="/login" className="hermes-btn hermes-btn-secondary text-base py-3.5 px-8">
            <TerminalIcon className="size-4" />
            See CLI in Action
          </Link>
        </div>
      </section>

      {/* ─── TERMINAL DEMO ─── */}
      <section className="relative z-10 px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="hermes-reveal hermes-reveal-d6 flex justify-center">
          <Terminal className="w-full max-w-2xl bg-black/60 border-white/[0.08] shadow-[0_0_40px_var(--gold-glow)] max-h-none">
            <TypingAnimation delay={0} className="text-[var(--gold)]">
              $ hermes auth --as alice
            </TypingAnimation>
            <AnimatedSpan delay={600} className="text-green-400/70">
              ✅ Switched to HR (Alice)
            </AnimatedSpan>

            <TypingAnimation delay={1200} className="text-[var(--gold)]">
              $ hermes job create "Senior Frontend Engineer"
            </TypingAnimation>
            <AnimatedSpan delay={2000} className="text-green-400/70">
              ✅ Job created (ID: 1)
            </AnimatedSpan>

            <TypingAnimation delay={2600} className="text-[var(--gold)]">
              $ hermes candidate invite --job 1 --name "Rahul"
            </TypingAnimation>
            <AnimatedSpan delay={3600} className="text-amber-400/70">
              📨 Share link: hermeshire.app/onboard/abc123
            </AnimatedSpan>

            <TypingAnimation delay={4200} className="text-[var(--gold)]">
              $ hermes candidate summary 1
            </TypingAnimation>
            <AnimatedSpan delay={5000} className="text-cyan-400/70">
              🤖 Rahul is a strong candidate with 5yrs React experience...
            </AnimatedSpan>

            <TypingAnimation delay={5600} className="text-[var(--gold)]">
              $ hermes candidate move 1 --stage INTERVIEW
            </TypingAnimation>
            <AnimatedSpan delay={6200} className="text-green-400/70">
              ✅ Rahul moved to Interview
            </AnimatedSpan>

            <TypingAnimation delay={6800} className="text-[var(--gold)]">
              $ hermes auth --as bob
            </TypingAnimation>
            <AnimatedSpan delay={7300} className="text-green-400/70">
              ✅ Switched to Interviewer (Bob)
            </AnimatedSpan>

            <TypingAnimation delay={7900} className="text-[var(--gold)]">
              $ hermes interview simulate 1
            </TypingAnimation>
            <AnimatedSpan delay={8700} className="text-green-400/70">
              ✅ Score: 82/100 — Strong Hire
            </AnimatedSpan>

            <TypingAnimation delay={9300} className="text-[var(--gold)]">
              $ hermes auth --as carol
            </TypingAnimation>
            <AnimatedSpan delay={9800} className="text-green-400/70">
              ✅ Switched to Manager (Carol)
            </AnimatedSpan>

            <TypingAnimation delay={10400} className="text-[var(--gold)]">
              $ hermes review hire 1
            </TypingAnimation>
            <AnimatedSpan delay={11200} className="text-emerald-400/80">
              🎉 Rahul hired! Complete audit logged.
            </AnimatedSpan>
          </Terminal>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="hermes-separator mb-16" />
        <h2 className="hermes-reveal hermes-reveal-d1 text-center text-3xl sm:text-4xl font-light mb-4 text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
          Your terminal is the interface
        </h2>
        <p className="hermes-reveal hermes-reveal-d2 text-center text-[var(--cream)]/50 text-sm mb-14 max-w-lg mx-auto">
          No web app. No browser. Just a terminal, your voice, and an AI copilot.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLI_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="hermes-card p-6"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="size-10 rounded-lg flex items-center justify-center mb-4 bg-[var(--gold-soft)]">
                  <Icon className="size-5 text-[var(--gold)]" />
                </div>
                <h3 className="font-semibold text-sm text-[var(--cream)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--cream)]/50 leading-relaxed font-mono">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="hermes-separator mb-16" />
        <h2 className="text-center text-3xl sm:text-4xl font-light mb-12 text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
          Three roles. One terminal.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hermes-card p-6 text-center border-amber-500/20">
            <div className="text-2xl font-bold mb-1 text-amber-400"
                 style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
              HR
            </div>
            <p className="text-xs text-[var(--cream)]/60 mt-2 leading-relaxed font-mono">
              hermes auth --as alice<br />
              hermes job create ...<br />
              hermes candidate invite ...<br />
              hermes candidate summary ...
            </p>
          </div>
          <div className="hermes-card p-6 text-center border-blue-500/20">
            <div className="text-2xl font-bold mb-1 text-blue-400"
                 style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
              Interviewer
            </div>
            <p className="text-xs text-[var(--cream)]/60 mt-2 leading-relaxed font-mono">
              hermes auth --as bob<br />
              hermes interview list<br />
              hermes candidate questions ...<br />
              hermes interview simulate ...
            </p>
          </div>
          <div className="hermes-card p-6 text-center border-emerald-500/20">
            <div className="text-2xl font-bold mb-1 text-emerald-400"
                 style={{ fontFamily: "var(--font-display)", fontVariationSettings: "\"SOFT\" 100, \"WONK\" 100, \"opsz\" 36" }}>
              Manager
            </div>
            <p className="text-xs text-[var(--cream)]/60 mt-2 leading-relaxed font-mono">
              hermes auth --as carol<br />
              hermes review list<br />
              hermes review hire ...<br />
              hermes review reject ...
            </p>
          </div>
        </div>
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
            One command to start hiring
          </h2>
          <p className="text-[var(--cream)]/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            No Docker. No database setup. No browser tabs. Just a terminal and an API key.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 bg-black/60 border border-white/[0.08] rounded-xl px-5 py-3.5 font-mono text-sm">
              <span className="text-[var(--gold)]">$</span>
              <code className="text-[var(--cream)]/90">curl -fsSL https://hermeshire.sh/install.sh | bash</code>
            </div>
            <Link href="/login" className="hermes-btn text-base py-3.5 px-8">
              Try the Demo
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
            HermesHire · <span className="font-mono">v0.1.0</span> · CLI
          </div>
          <div className="flex gap-6 text-xs text-[var(--cream)]/30">
            <span>Powered by Hermes-4-70B</span>
            <span>Hackathon MVP</span>
            <span>~3 hour build</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
