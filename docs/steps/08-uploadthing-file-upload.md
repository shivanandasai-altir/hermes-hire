# Step 8: Uploadthing — File Upload for Resumes

**Estimated time:** ~15 min  
**Replaces:** Client-side PDF extraction with server-side file storage  
**Why:** Store actual PDF files, get back a URL, extract text server-side for AI

---

## Setup

### 1. Environment Variables

```env
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

Get these from [uploadthing.com](https://uploadthing.com) → Create a new app → API Keys.

### 2. Install

```bash
pnpm add uploadthing @uploadthing/react
```

### 3. API Route

`app/api/uploadthing/core.ts` — defines the file router:

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    text: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { timestamp: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // file.url ← the uploaded file URL
      // Store on Candidate record: candidate.resumeFileUrl = file.url
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

`app/api/uploadthing/route.ts` — the Next.js route handler:

```typescript
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
```

### 4. Client Component

`lib/uploadthing.ts` — generates typed upload components:

```typescript
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
```

---

## Usage in Forms

### Replace the custom file upload zone

Before (current implementation):
```
- Client-side PDF text extraction via pdfjs-dist
- Stores only extracted text in resumeText
- Original PDF file is lost
```

After (Uploadthing):
```
1. User drops PDF on UploadDropzone component
2. Uploadthing uploads to CDN, returns URL
3. Store URL on candidate record (resumeFileUrl)
4. Optionally extract text server-side or pass URL to CLI
```

### In the Add Candidate dialog

```tsx
import { UploadDropzone } from "@/lib/uploadthing";

<UploadDropzone
  endpoint="resumeUploader"
  onClientUploadComplete={(res) => {
    // res[0].url → the uploaded PDF URL
    setValue("resumeFileUrl", res[0].url);
    // res[0].name → original filename
  }}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
/>
```

### In the Candidate onboarding form

Same pattern — replace the `input type="file"` with `UploadDropzone`.

---

## Data Model Update

Add to Prisma schema:

```prisma
model Candidate {
  // ... existing fields
  resumeFileUrl  String?   // Uploadthing URL to the PDF
  resumeFileName String?   // Original filename for display
}
```

---

## Text Extraction for AI

Once the PDF is uploaded to Uploadthing, you have two options to get text for Hermes AI:

### Option A: Client-side extraction (current approach)
Keep the pdfjs-dist extraction on the client before upload. Store both:
- `resumeFileUrl` → the PDF URL from Uploadthing
- `resumeText` → the extracted text (for AI)

### Option B: Server-side extraction
When the AI needs the text, download the PDF from Uploadthing URL and extract server-side:
```typescript
const response = await fetch(resumeFileUrl);
const buffer = await response.arrayBuffer();
const pdf = await pdfjs.getDocument({ data: buffer }).promise;
// extract text...
```

---

## Prisma / Schema Update

After implementing, run:
```bash
npx prisma db push
```

---

## Files to Create

- `app/api/uploadthing/core.ts`
- `app/api/uploadthing/route.ts`
- `lib/uploadthing.ts`

## Files to Modify

- `.env` — add `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`
- `app/candidates/page.tsx` — replace file upload zone with UploadDropzone
- `app/onboard/[token]/page.tsx` — replace file upload zone with UploadDropzone

## Acceptance Criteria

- [ ] HR can upload a PDF via UploadDropzone
- [ ] File URL is stored on Candidate record
- [ ] AI still gets extracted text (either client or server-side)
- [ ] Onboarding form also supports file upload via Uploadthing
