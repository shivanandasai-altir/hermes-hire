"use client";

import { useState, useMemo, use } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
  Sparkles,
  UserPlus,
  Briefcase,
  Upload,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";

// ─── Zod Schemas ───

const candidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  resumeText: z.string().min(20, "Resume must be at least 20 characters"),
  resumeFileUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

// ─── Types ───

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentStage: string;
  aiSummary: string | null;
  jobTitle: string;
  createdAt: string;
}

// ─── Stage Colors ───

const stageColors: Record<string, string> = {
  PENDING_ONBOARDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPLIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SCREENING: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  INTERVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MANAGER_REVIEW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  HIRED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const stageLabels: Record<string, string> = {
  PENDING_ONBOARDING: "Pending",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  MANAGER_REVIEW: "Manager Review",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

// ─── Mock Data ───

const MOCK_CANDIDATES: Candidate[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul@email.com", phone: "+1-555-0101", currentStage: "APPLIED", aiSummary: null, jobTitle: "Senior Frontend Engineer", createdAt: "2025-05-22T10:00:00Z" },
  { id: "2", name: "Jane Doe", email: "jane@example.com", phone: "+1-555-0102", currentStage: "INTERVIEW", aiSummary: "Strong React skills, 6 years experience", jobTitle: "Senior Frontend Engineer", createdAt: "2025-05-21T09:00:00Z" },
  { id: "3", name: "Alice Chen", email: "alice@example.com", phone: "+1-555-0103", currentStage: "MANAGER_REVIEW", aiSummary: "Excellent system design, leadership experience", jobTitle: "Senior Frontend Engineer", createdAt: "2025-05-20T08:00:00Z" },
  { id: "4", name: "Bob Martinez", email: "bob@example.com", phone: "+1-555-0104", currentStage: "HIRED", aiSummary: "Strong full-stack skills, team player", jobTitle: "Senior Frontend Engineer", createdAt: "2025-05-19T07:00:00Z" },
  { id: "5", name: "Carol Williams", email: "carol@example.com", phone: "+1-555-0105", currentStage: "REJECTED", aiSummary: "Good fundamentals, lacks React depth", jobTitle: "Senior Frontend Engineer", createdAt: "2025-05-18T06:00:00Z" },
];

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stageColors[stage] || "bg-gray-500/10 text-gray-400"}`}>
      {stageLabels[stage] || stage}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Resume Upload Component ───

import type { UseFormReturn } from "react-hook-form";

interface ResumeUploadProps {
  register: UseFormReturn<CandidateFormData>["register"];
  setValue: UseFormReturn<CandidateFormData>["setValue"];
  errors: UseFormReturn<CandidateFormData>["formState"]["errors"];
}

function ResumeUpload({ register, setValue, errors }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      let text = "";

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await import("pdfjs-dist").then(m => m.getDocument({ data: arrayBuffer }).promise);
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => (item as { str: string }).str).join(" ") + "\n";
        }
      } else {
        // Fallback: try reading as text anyway
        text = await file.text();
      }

      setValue("resumeText", text.trim(), { shouldValidate: true });
    } catch (err) {
      console.error("File read error:", err);
      // Fallback: read raw text
      try {
        const text = await file.text();
        setValue("resumeText", text.trim(), { shouldValidate: true });
      } catch {}
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">
        Resume / Experience
      </label>

      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/[0.08] rounded-xl cursor-pointer hover:border-[#d4a853]/30 transition-colors bg-black/20">
        <input
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="size-6 rounded-full border-2 border-[#d4a853] border-t-transparent animate-spin" />
            <span className="text-xs text-[#7d7c7a]">Reading file...</span>
          </div>
        ) : fileName ? (
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[#d4a853]" />
            <span className="text-sm text-[#ece8e1]">{fileName}</span>
            <span className="text-xs text-emerald-400 ml-1">✓ Loaded</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="size-6 text-[#7d7c7a]" />
            <span className="text-xs text-[#7d7c7a]">
              Click to upload PDF, DOCX, or TXT
            </span>
          </div>
        )}
      </label>

      {/* Uploadthing Dropzone */}
              <UploadDropzone
                endpoint="resumeUploader"
                className="mb-3 border-white/[0.08] ut-button:bg-[#d4a853] ut-button:text-black ut-button:after:bg-[#e8c06a] ut-button:rounded-xl ut-label:text-[#ece8e1] ut-allowed-content:text-[#7d7c7a]"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setFileName(res[0].name);
                    fetch(res[0].url).then(r => r.text()).then(t => { if (t.length > 20) setValue("resumeText", t, { shouldValidate: true }); }).catch(() => {});
                  }
                }}
              />

      <textarea
        {...register("resumeText")}
        rows={4}
        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors resize-none"
        placeholder="Or paste resume text here..."
      />
      {errors.resumeText && <p className="text-red-400 text-xs mt-1">{errors.resumeText.message}</p>}
    </div>
  );
}

// ─── Add Candidate Dialog ───

function AddCandidateDialog({ onAdd }: { onAdd: (data: CandidateFormData) => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  });

  const onSubmit = (data: CandidateFormData) => {
    onAdd(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="gap-2 rounded-xl font-medium text-sm inline-flex items-center px-4 py-2" style={{
          background: "linear-gradient(135deg, #d4a853, #e8c06a)",
          color: "#000",
          boxShadow: "0 4px 24px rgba(212,168,83,0.15)",
        }}>
          <Plus className="size-4 mr-2" />
          Add Candidate
      </DialogTrigger>
      <DialogContent className="bg-[#0c1125] border border-white/[0.06] rounded-2xl p-0 max-w-lg">
        <div className="p-6 sm:p-8">
          <div className="h-[3px] rounded-full mb-6"
               style={{ background: "linear-gradient(90deg, transparent, #d4a853 20%, #e8c06a 50%, #d4a853 80%, transparent)" }} />
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-[#ece8e1]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"SOFT" 100, "WONK" 100, "opsz" 36' }}>
              Add Candidate
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Full Name</label>
              <input {...register("name")}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="e.g. Rahul Sharma" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Email</label>
              <input {...register("email")}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="rahul@email.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-[#7d7c7a] text-xs uppercase tracking-widest mb-2">Phone (optional)</label>
              <input {...register("phone")}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
                placeholder="+1-555-0100" />
            </div>
            <ResumeUpload register={register} setValue={setValue} errors={errors} />
            <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-sm" style={{
              background: "linear-gradient(135deg, #d4a853, #e8c06a)", color: "#000",
              boxShadow: "0 4px 24px rgba(212,168,83,0.15)",
            }}>
              <UserPlus className="size-4 mr-2" /> Add Candidate
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───

export default function CandidatesPage() {
  const [data, setData] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Candidate>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">
          Name <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-[#ece8e1] text-sm font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "email",
      header: () => <span className="text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">Email</span>,
      cell: ({ row }) => (
        <div className="text-[#ece8e1]/60 text-sm">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: () => <span className="text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">Position</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[#ece8e1]/60 text-sm">
          <Briefcase className="size-3 text-[#d4a853]/50" />
          {row.original.jobTitle}
        </div>
      ),
    },
    {
      accessorKey: "currentStage",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">
          Stage <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: ({ row }) => <StageBadge stage={row.original.currentStage} />,
    },
    {
      accessorKey: "aiSummary",
      header: () => <span className="text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">AI Summary</span>,
      cell: ({ row }) => row.original.aiSummary ? (
        <div className="flex items-center gap-1.5 text-[#ece8e1]/50 text-xs max-w-[200px] truncate">
          <Sparkles className="size-3 shrink-0 text-[#d4a853]" />
          {row.original.aiSummary}
        </div>
      ) : (
        <span className="text-[#7d7c7a]/40 text-xs italic">Not generated</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-[#7d7c7a] text-xs uppercase tracking-widest font-medium">
          Added <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[#ece8e1]/50 text-xs">
          <Clock className="size-3" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleAdd = (formData: CandidateFormData) => {
    const newCandidate: Candidate = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      currentStage: "APPLIED",
      aiSummary: null,
      jobTitle: "Senior Frontend Engineer",
      createdAt: new Date().toISOString(),
    };
    setData(prev => [newCandidate, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#060a17]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-[#ece8e1]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"SOFT" 100, "WONK" 100, "opsz" 36' }}>
              Candidates
            </h1>
            <p className="text-[#7d7c7a] text-sm mt-1">
              {data.length} candidate{data.length !== 1 ? "s" : ""} across all stages
            </p>
          </div>
          <AddCandidateDialog onAdd={handleAdd} />
        </div>

        {/* Search + Filters */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#7d7c7a]" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search candidates by name, email, or position..."
            className="w-full bg-[#0c1125] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-[#ece8e1] text-sm placeholder:text-[#7d7c7a]/50 focus:outline-none focus:border-[#d4a853]/50 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-[#0c1125] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-white/[0.06]">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4 text-left">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-16">
              <div className="size-16 rounded-full bg-[rgba(212,168,83,0.08)] flex items-center justify-center mx-auto mb-4">
                <Search className="size-6 text-[#d4a853]/30" />
              </div>
              <p className="text-[#7d7c7a] text-sm">
                {globalFilter ? "No candidates match your search" : "No candidates yet"}
              </p>
              {!globalFilter && (
                <p className="text-[#7d7c7a]/50 text-xs mt-1">Add your first candidate to get started</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-[#7d7c7a] text-xs">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-2 rounded-lg text-[#7d7c7a] hover:text-[#ece8e1] hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronsLeft className="size-4" />
              </button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 rounded-lg text-[#7d7c7a] hover:text-[#ece8e1] hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 rounded-lg text-[#7d7c7a] hover:text-[#ece8e1] hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronRight className="size-4" />
              </button>
              <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-2 rounded-lg text-[#7d7c7a] hover:text-[#ece8e1] hover:bg-white/[0.04] disabled:opacity-30 transition-colors">
                <ChevronsRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
