import { askLLM } from "../../lib/llm-router.js";
import { buildSystemPrompt } from "../../lib/system-prompt.js";
import { searchForContext } from "../../lib/rag-search.js";

export async function POST(request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages array is required" }, { status: 400 });
    }
    const query = messages[messages.length - 1].content;
    const context = await searchForContext(query);
    const systemPrompt = buildSystemPrompt(
      context || "No specific product data loaded yet. Answer with general BenchDepot knowledge."
    );
    const reply = await askLLM(messages, systemPrompt);
    return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error.status === 401
      ? "Invalid API key. Check your ANTHROPIC_API_KEY in environment variables."
      : error.message || "Something went wrong";
    return Response.json({ error: message }, { status: error.status || 500 });
  }
}
