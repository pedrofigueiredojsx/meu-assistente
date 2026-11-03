import { generateStream, type Message } from "@/lib/llm";
import { PERSONAS, type PersonaId } from "@/lib/personas";

export async function POST(request: Request) {
  const { messages, persona } = (await request.json()) as {
    messages: Message[];
    persona: PersonaId;
  };

  const systemPrompt = PERSONAS[persona]?.prompt ?? PERSONAS.geral.prompt;

  try {
    const stream = await generateStream([
      { role: "system", content: systemPrompt },
      ...messages,
    ]);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Erro no /api/chat/stream:", error);
    return Response.json(
      { error: "Falha ao falar com o modelo" },
      { status: 500 },
    );
  }
}
