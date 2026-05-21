# Hermes API Reference — Nous Research Inference API

> Based on official API docs at `https://inference-api.nousresearch.com/v1`
> OpenAPI spec available at `/api/openapi`

---

## 1. Base URL

```
https://inference-api.nousresearch.com/v1
```

Works with any OpenAI-compatible client (including Vercel AI SDK, LangChain, etc.).

---

## 2. Authentication

### Option A: API Key + Credits (recommended)

1. Register at [https://portal.nousresearch.com](https://portal.nousresearch.com)
2. Add credits or activate a subscription → generate an API key
3. Include in all requests:

```
Authorization: Bearer sk-nous-...
```

### Option B: x402 Protocol (beta — pay-per-request via Solana USDC)

- No account or API key needed
- Requires a Solana wallet with USDC funds
- Send request without `Authorization` → get `402` response with payment requirements
- Sign payment → retry with `X-PAYMENT` header
- ⚠️ `max_tokens` is required for x402 (you're charged for the full `max_tokens` amount regardless of actual usage)

---

## 3. Available Models

| Model | Context | Notes |
|-------|---------|-------|
| `Hermes-4.3-36B` | 128k | Fastest, good for most tasks |
| `Hermes-4-70B` | 128k | 🎯 **Current default in HermesHire** |
| `Hermes-4-405B` | 128k | Most capable, slower, more expensive |

See [portal.nousresearch.com/info](https://portal.nousresearch.com/info) for pricing.

---

## 4. Rate Limits

| Tier | RPM | TPM |
|------|-----|-----|
| Free | 45 | 450,000 |
| Default paid | 180 | 720,000 |
| Plus | 400 | 4,000,000 |
| Super | 800 | 8,000,000 |
| Ultra | 1,600 | 16,000,000 |

---

## 5. Chat Completions Endpoint

### `POST /v1/chat/completions`

Full OpenAI Chat API compatibility.

### Request

```json
{
  "model": "Hermes-4-70B",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "What is the capital of France?" }
  ],
  "temperature": 0.7,
  "max_tokens": 100
}
```

### Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1696109012,
  "model": "Hermes-4-70B",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 26,
    "completion_tokens": 14,
    "total_tokens": 40
  }
}
```

### Supported Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `model` | string | required | One of the available models |
| `messages` | array | required | `{ role, content }[]` — roles: system, user, assistant |
| `temperature` | number | 0.7 | 0.0 - 2.0 |
| `max_tokens` | integer | varies | **Required for x402** |
| `stream` | boolean | false | SSE streaming |
| `top_p` | number | 1.0 | |
| `frequency_penalty` | number | 0.0 | |
| `presence_penalty` | number | 0.0 | |
| `stop` | string/array | null | Stop sequences |

---

## 6. Completions Endpoint

### `POST /v1/completions`

Compatible with OpenAI's Completions API (non-chat).

### Request

```json
{
  "model": "Hermes-4.3-36B",
  "prompt": "Once upon a time",
  "max_tokens": 60,
  "temperature": 0.8
}
```

---

## 7. Reasoning Support

Hermes 4 models support reasoning chains (thinking before answering).

### To enable reasoning

Use this **system prompt**:

> *"You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside `<think>` `</think>` tags, and then provide your solution or response to the problem."*

### Where reasoning appears

| Scenario | Reasoning location |
|----------|-------------------|
| Deep Hermes 3 | In response content between `<think></think>` tags |
| Hermes 4 + reasoning system prompt (no prefill) | In the `reasoning_content` field of the response |
| Hermes 4 + prefilled `<think>` in response | In content between `<think></think>` tags |

---

## 8. Usage in HermesHire

### Current config (`.env`)

```env
HERMES_API_URL="https://inference-api.nousresearch.com/v1"
HERMES_API_KEY="sk-nous-..."
HERMES_MODEL="Hermes-4-70B"
```

### Code reference

All API calls go through `services/ai.ts`:

```typescript
const response = await fetch(`${HERMES_API_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HERMES_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.HERMES_MODEL || "Hermes-4-70B",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: maxTokens ?? 1024,
  }),
});
```

### Model selection guidance

| Use case | Recommended model | Rationale |
|----------|------------------|-----------|
| Candidate summaries | `Hermes-4-70B` | Good balance of quality + speed |
| Interview questions | `Hermes-4.3-36B` | Fast, sufficient for question generation |
| Meeting scheduling | `Hermes-4.3-36B` | Simple JSON parsing, doesn't need 70B |
| Voice feedback | `Hermes-4-70B` | Complex scoring requires better reasoning |
| Hiring recommendation | `Hermes-4-70B` | Decision-critical, wants best reasoning |
| Deep analysis | `Hermes-4-405B` | When you need the reasoning system prompt |

---

## 9. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `401 Unauthorized` | Invalid or missing API key | Check `HERMES_API_KEY` in `.env` |
| `429 Too Many Requests` | Rate limit exceeded | Wait or upgrade tier |
| `402 Payment Required` | x402 — needs payment | Send with `Authorization` header instead |
| Empty response content | Model returned no content | Add `max_tokens` explicitly |
| Slow responses | Model too large for task | Switch to `Hermes-4.3-36B` for simple tasks |
| `model not found` | Wrong model name | Use exact name from available models list |
