import type { Role, Stage } from "@/lib/constants";

export interface AuditLogEntry {
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface DbUser {
  id: string;
  name: string;
  role: Role;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  status: "OPEN" | "CLOSED";
  createdById: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  resumeText: string;
  currentStage: Stage;
  jobId: string;
  aiSummary: string | null;
  aiQuestions: string | null;
  aiRecommendation: string | null;
  meetLink: string | null;
  auditLogs: AuditLogEntry[];
  createdAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  interviewerId: string;
  status: "ASSIGNED" | "COMPLETED";
  scheduledAt: string | null;
  transcript: string | null;
  vapiCallId: string | null;
}

export interface Feedback {
  id: string;
  interviewId: string;
  rating: number;
  recommendation: string;
  comments: string;
  createdAt: string;
}

export interface Database {
  version: number;
  users: DbUser[];
  jobs: Job[];
  candidates: Candidate[];
  interviews: Interview[];
  feedback: Feedback[];
}
