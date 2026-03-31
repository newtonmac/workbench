import Anthropic from "@anthropic-ai/sdk";

async function anthropicProvider(messages, systemPrompt) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return response.content[0].text;
}

// Ollama (Local) — uncomment when ready
// async function ollamaProvider(messages, systemPrompt) {
//   const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
//   const model = process.env.OLLAMA_MODEL || "llama3.2";
//   const response = await fetch(`${baseUrl}/api/chat`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       model, stream: false,
//       messages: [{ role: "system", content: systemPrompt }, ...messages],
//     }),
//   });
//   const data = await response.json();
//   return data.message.content;
// }

// OpenAI-compatible — uncomment when ready
// async function openaiProvider(messages, systemPrompt) {
//   const response = await fetch(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
//     body: JSON.stringify({
//       model: process.env.OPENAI_MODEL || "gpt-4o-mini",
//       messages: [{ role: "system", content: systemPrompt }, ...messages],
//     }),
//   });
//   const data = await response.json();
//   return data.choices[0].message.content;
// }

const providers = {
  anthropic: anthropicProvider,
};

export async function askLLM(messages, systemPrompt) {
  const providerName = process.env.LLM_PROVIDER || "anthropic";
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown LLM provider: "${providerName}". Available: ${Object.keys(providers).join(", ")}`);
  return provider(messages, systemPrompt);
}

export function getActiveProvider() {
  return process.env.LLM_PROVIDER || "anthropic";
}
