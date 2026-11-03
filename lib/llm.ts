export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generate(messages: Message[]): Promise<string> {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:latest",
      stream: false,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama respondeu ${res.status}`);
  }

  const data = await res.json();
  return data.message.content;
}

export async function generateStreamOllama(
  messages: Message[],
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2", stream: true, messages }),
  });

  if (!res.ok || !res.body) {
    const detalhe = await res.text();
    throw new Error(`Ollama responde ${res.status}: ${detalhe}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);
          if (data.message?.content) {
            controller.enqueue(encoder.encode(data.message.content));
          }
        }
      },
    }),
  );
}

async function generateStreamGroq(
  messages: Message[],
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL,
      stream: true,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    const detalhe = await res.text();
    throw new Error(`Groq respondeu ${res.status}: ${detalhe}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          const data = JSON.parse(payload);
          const text = data.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      },
    }),
  );
}

export async function generateStream(
  messages: Message[],
): Promise<ReadableStream<Uint8Array>> {
  if (process.env.LLM_PROVIDER === "groq") {
    return generateStreamGroq(messages);
  }
  return generateStreamOllama(messages);
}
