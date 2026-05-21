"use client";

import { motion, type Easing } from "motion/react";
import {
  Sparkles,
  MessageSquareText,
  Mic,
  Calendar,
  Users,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Candidate Summary",
    desc: "Resume analysis and role-fit assessment powered by Hermes-4-70B.",
  },
  {
    icon: MessageSquareText,
    title: "AI Interview Questions",
    desc: "Role-specific technical and behavioral questions generated in seconds.",
  },
  {
    icon: Mic,
    title: "Voice Interviews",
    desc: "AI agent conducts calls via Vapi, captures transcripts, auto-generates feedback.",
  },
  {
    icon: Calendar,
    title: "Google Meet Scheduling",
    desc: "Type 'Schedule tomorrow at 2pm' — Hermes + gog create the event with a Meet link.",
  },
  {
    icon: Users,
    title: "Role-Based Workspace",
    desc: "HR, Interviewer, and Manager each see exactly what they need.",
  },
  {
    icon: Target,
    title: "Hiring Decisions",
    desc: "Managers review AI insights + feedback, then Hire or Reject with one click.",
  },
];

const ease: Easing = [0.22, 1, 0.36, 1];

const cardVariants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3, ease },
  },
};

const iconVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.1,
    y: -2,
    transition: { duration: 0.25, ease },
  },
};

const contentVariants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: 0.25, delay: 0.05, ease },
  },
};

const glowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.4, ease },
  },
};

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[number];
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-card)] p-6 transition-shadow duration-300 hover:border-[var(--gold-soft)] hover:shadow-[0_0_40px_var(--gold-glow),0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <motion.div variants={iconVariants} className="mb-4">
        <div className="inline-flex size-10 items-center justify-center rounded-lg bg-[var(--gold-soft)]">
          <Icon className="size-5 text-[var(--gold)]" />
        </div>
      </motion.div>

      <motion.div variants={contentVariants}>
        <h3 className="mb-2 text-sm font-semibold text-[var(--cream)]">
          {feature.title}
        </h3>
        <p className="text-xs leading-relaxed text-[var(--cream)]/50">
          {feature.desc}
        </p>
      </motion.div>

      <motion.div
        variants={glowVariants}
        className="pointer-events-none absolute -inset-px rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, var(--gold-soft) 0%, transparent 50%, transparent 100%)",
        }}
      />
    </motion.div>
  );
}

export function AnimatedFeatures() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
