# Hermes Agent — Setup & API Reference

Hermes Agent (Nous Research) powers all AI features in HermesHire: candidate summaries, interview questions, hiring recommendations, meeting scheduling parsing, and voice feedback analysis.

---

## 1. Get an API Key

Hermes 3 is available through several providers:

| Provider | Docs | Base URL | Model |
|----------|------|----------|-------|
| **Nous Research** (official) | [nousresearch.com](https://nousresearch.com) | `https://inference-api.nousresearch.com/v1` | `Hermes-4-70B` |
| **Together AI** | [together.ai](https://together.ai) | `https://api.together.xyz/v1` | `NousResearch/Hermes-3-Llama-3.1-70B` |
| **Fireworks AI** | [fireworks.ai](https://fireworks.ai) | `https://api.fireworks.ai/inference/v1` | `nousresearch/hermes-3` |
| **Self-hosted** (vLLM, Ollama) | Your own infra | `http://localhost:8000/v1` | `hermes-3` |

**For the hackathon:** Nous Research provides free API keys for hackathon projects. Sign up at [hermes.ai](https://hermes.ai) or use Together AI's free tier.

---

## 2. Environment Variables

Add to `.env`:

```env
# Required: Hermes Agent API key
HERMES_API_KEY="sk-hermes-..."

# Optional: Custom API endpoint (default: https://api.hermes.ai/v1)
HERMES_API_URL="https://api.hermes.ai/v1"

# Optional: Model name (default: hermes-3)
HERMES_MODEL="hermes-3"
```

---

## 3. Centralized Client

All Hermes API calls go through `services/ai.ts`:

```typescript
import { callHermes } from "@/services/ai";

const summary = await callHermes([
  { role: "system", content: "You are an HR recruiter..." },
  { role: "user", content: "Summarize this resume..." },
]);
```

### Core function

```typescript
async function callHermes(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options?: {
    model?: string;       // default: hermes-3
    temperature?: number; // default: 0.3
    maxTokens?: number;   // default: 1024
  }
): Promise<string>
```

Returns the raw text response. If the API returns an error, it throws.

---

## 4. Hiring-Specific Functions

| Function | File | Trigger | Input | Output |
|----------|------|---------|-------|--------|
| `generateCandidateSummary()` | `services/ai.ts` | HR "Generate AI Summary" | resumeText, jobTitle | 3-5 paragraph analysis |
| `generateInterviewQuestions()` | `services/ai.ts` | Interviewer "Generate Questions" | candidateProfile, jobTitle | 5-7 numbered questions |
| `generateRecommendation()` | `services/ai.ts` | Manager review page | candidateSummary, feedbackSummary | Hire/Reject recommendation + reasoning |

### Usage examples

```typescript
// HR: AI candidate summary
const summary = await generateCandidateSummary(resumeText, "Senior Frontend Engineer");

// Interviewer: AI interview questions
const questions = await generateInterviewQuestions(candidateSummary, "Senior Frontend Engineer");

// Manager: AI recommendation
const recommendation = await generateRecommendation(candidateSummary, feedbackComments);
```

---

## 5. Response Format

Hermes returns plain text. For structured data, instruct Hermes in the system prompt to return JSON:

```typescript
const result = await callHermes([
  {
    role: "system",
    content: "Return ONLY a JSON object with this exact structure: { \"score\": number, \"reasoning\": string }",
  },
  { role: "user", content: "Analyze..." },
]);

const parsed = JSON.parse(stripCodeFences(result));
```

Use the `stripCodeFences()` utility from `services/ai.ts` to clean markdown-wrapped responses.

---

## 6. Error Handling

The Hermes client throws on:
- **HTTP errors** (4xx/5xx) — API key invalid, rate limited, model unavailable
- **Empty responses** — API returned success but no content
- **Network errors** — service unreachable

Handle errors at the UI level:

```typescript
try {
  const summary = await generateCandidateSummary(resumeText, jobTitle);
  // store summary in DB
} catch (error) {
  toast.error("AI summary generation failed. Please try again.");
}
```

No mock/fallback responses — the app shows "AI unavailable" gracefully.

---

## 7. Caching Strategy

AI responses are stored on the `Candidate` model to avoid redundant API calls:

| Field | Stores |
|-------|--------|
| `Candidate.aiSummary` | `generateCandidateSummary()` result |
| `Candidate.aiQuestions` | `generateInterviewQuestions()` result |
| `Candidate.aiRecommendation` | `generateRecommendation()` result |

Only call Hermes when the field is null/empty. If the user re-generates, overwrite the field.

---

## 8. Testing

```typescript
// Mock the Hermes client
jest.mock("@/services/ai", () => ({
  callHermes: jest.fn().mockResolvedValue("Mocked AI response"),
  generateCandidateSummary: jest.fn().mockResolvedValue("Mocked summary"),
}));
```

Tests should verify:
1. Correct system prompts are constructed for each function
2. Responses are stored on the correct Candidate field
3. Errors are handled gracefully in the UI

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Unauthorized` | Invalid API key | Check `HERMES_API_KEY` in `.env` |
| `429 Too Many Requests` | Rate limited | Wait, reduce frequency, or upgrade tier |
| `503 Service Unavailable` | Provider outage | Switch providers or retry |
| Empty response | Model returned no content | Check prompt formatting |
| JSON parse error | Model returned malformed JSON | Use `stripCodeFences()` helper |

---

## 10. Provider Switching

To switch providers, change `HERMES_API_URL`:

```env
# Together AI
HERMES_API_URL="https://api.together.xyz/v1"
HERMES_API_KEY="together-..."
HERMES_MODEL="NousResearch/Hermes-3-Llama-3.1-70B"

# Fireworks AI
HERMES_API_URL="https://api.fireworks.ai/inference/v1"
HERMES_API_KEY="fireworks-..."
HERMES_MODEL="nousresearch/hermes-3"

# Self-hosted (Ollama)
HERMES_API_URL="http://localhost:11434/v1"
HERMES_API_KEY="ollama"  # not checked locally
```

The `services/ai.ts` client is provider-agnostic — it uses the OpenAI-compatible chat completions format.
