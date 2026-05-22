"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";

interface JobDetails {
  title: string;
  companyName: string;
  companyDescription: string;
}

const MOCK_JOB: JobDetails = {
  title: "Senior Frontend Engineer",
  companyName: "Altir",
  companyDescription:
    "Altir is an AI-native hiring platform that helps teams collaborate across the complete recruitment workflow. We're building the future of hiring.",
};

export default function OnboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<"form" | "submitting" | "done">("form");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    resumeText: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("submitting");

    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#060a17] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0c1125] border border-white/[0.06] rounded-2xl p-10 text-center">
          <div className="size-16 rounded-full bg-[rgba(212,168,83,0.12)] flex items-center justify-center mx-auto mb-6">
            <Check className="size-8 text-[#d4a853]" />
          </div>
          <h1 className="text-2xl font-light text-[#ece8e1] mb-2"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"SOFT" 100, "WONK" 100, "opsz" 36' }}>
            Application Submitted
          </h1>
          <p className="text-[#7d7c7a] text-sm leading-relaxed mb-6">
            Thank you, <strong className="text-[#ece8e1]">{form.name}</strong>!
            Your resume has been received. The hiring team will review your
            application and get back to you soon.
          </p>
          <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 mb-6 text-left">
            <p className="text-[#7d7c7a] text-xs uppercase tracking-widest mb-1">Position</p>
            <p className="text-[#ece8e1] text-sm">{MOCK_JOB.title}</p>
          </div>
          <p className="text-[#7d7c7a] text-xs">Powered by HermesHire · AI Hiring Copilot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a17] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
            <rect x="2" y="2" width="28" height="28" rx="8" stroke="#d4a853" strokeWidth="1.5" fill="none"/>
            <path d="M10 10h4l4 6 4-6h4" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M10 22V16l6 6V16" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
          </svg>
        </div>

        <div className="bg-[#0c1125] border border-white/[0.06] rounded-2xl p-8 sm:p-10">
          {/* Gold accent */}
          <div className="h-[3px] rounded-full mb-8"
               style={{ background: "linear-gradient(90deg, transparent, #d4a853 20%, #e8c06a 50%, #d4a853 80%, transparent)" }} />

          <h1 className="text-2xl font-light text-[#ece8e1] mb-2 text-center"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"SOFT" 100, "WONK" 100, "opsz" 36' }}>
            You're invited
          </h1>
          <p className="text-[#7d7c7a] text-sm text-center mb-8">
            Interview for <strong className="text-[#d4a853]">{MOCK_JOB.title}</strong> at <strong className="text-[#d4a853]">{MOCK_JOB.companyName}</strong>
          </p>

          {MOCK_JOB.companyDescription && (
            <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 mb-6">
              <p className="text-[#7d7c7a] text-xs uppercase tracking-widest mb-1">About {MOCK_JOB.companyName}</p>
              <p className="text-[#ece8e1]/70 text-sm leading-relaxed">{MOCK_JOB.companyDescription}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Full Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Email Address</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="e.g. rahul@email.com"
              />
            </div>

            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="e.g. +1-555-0123"
              />
            </div>

            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Resume / Experience</label>

              <UploadDropzone
                endpoint="resumeUploader"
                className="mb-3 border-white/[0.08] ut-button:bg-[#d4a853] ut-button:text-black ut-button:after:bg-[#e8c06a] ut-button:rounded-xl ut-label:text-[#ece8e1] ut-allowed-content:text-[#7d7c7a]"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    fetch(res[0].url).then(r => r.text()).then(t => {
                      if (t && t.length > 20) setForm(f => ({ ...f, resumeText: t }));
                    }).catch(() => {});
                  }
                }}
              />

              <textarea
                required
                rows={5}
                value={form.resumeText}
                onChange={e => setForm(f => ({ ...f, resumeText: e.target.value }))}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors resize-none"
                placeholder="Or paste your resume text here..."
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={step === "submitting"}
              className="w-full h-12 rounded-xl font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #d4a853, #e8c06a)",
                color: "#000",
                boxShadow: "0 4px 24px rgba(212,168,83,0.15)",
              }}
            >
              {step === "submitting" ? (
                <><Loader2 className="size-4 animate-spin mr-2" /> Submitting...</>
              ) : (
                <><Send className="size-4 mr-2" /> Submit Application</>
              )}
            </Button>
          </form>

          <p className="text-[#7d7c7a] text-xs text-center mt-6">Powered by HermesHire · AI Hiring Copilot</p>
        </div>
      </div>
    </div>
  );
}
