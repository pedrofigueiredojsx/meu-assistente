import { generate, type Message } from "@/lib/llm";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { getRevalidateReason } from "next/dist/server/instrumentation/utils";

export async function POST(request: Request) {
  const { messages, persona } = (await request.json()) as {
    messages: Message[];
    persona: PersonaId;
  };

  const systemPrompt = PERSONAS[persona]?.prompt ?? PERSONAS.geral.prompt;

  try {
    const reply = await generate([
      { role: "system", content: systemPrompt },
      ...messages,
    ]);
    return Response.json({ reply });
  } catch (error) {
    console.error("Erro no /api/chat:", error);
    return Response.json(
      { error: "Falha ao falar com o modelo" },
      { status: 500 },
    );
  }
}
