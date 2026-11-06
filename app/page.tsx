"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/lib/llm";
import type { PersonaId } from "@/lib/personas";

const STORAGE_KEY = "meu-assistente:conversa";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<PersonaId>("geral");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setMessages(data.messages ?? []);
        setPersona(data.persona ?? "geral");
      }
    } catch (error) {
      console.error(error);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, persona }));
  }, [messages, persona, loaded]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, persona }),
      });
      if (!res.ok || !res.body) {
        const detalhe = await res.text();
        throw new Error(`Stream falhou: ${res.status} ${detalhe}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        reply += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Erro ao falar com o modelo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col p-4">
      <h1 className="bg-linear-to-r from-blue-600 to-violet-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
        Meu assistente
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Chat de IA com Next.js, streaming e personalidades
      </p>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as PersonaId)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25"
        >
          <option value="geral">Geral</option>
          <option value="wow">Especialista WoW PvP</option>
        </select>

        <button
          onClick={() => setMessages([])}
          className="rounded-lg border border-gray-400 px-4 py-2 text-sm font-semibold transition hover:bg-gray-400/20 active:scale-95"
        >
          Nova conversa
        </button>
      </div>

      <div className="my-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 leading-relaxed 
              ${
                m.role === "user"
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-gray-200 text-gray-900"
              }`}
          >
            {m.content}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div>Pensando...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte alguma coisa..."
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outlin-none focus:ring-2 focus:ring-blue-600/25"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-blue-700 enabled:active:scale-95"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}
