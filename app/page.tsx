"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/lib/llm";
import type { PersonaId } from "@/lib/personas";
import { load } from "next/dist/compiled/@edge-runtime/primitives/load";

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
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>Meu Assistente</h1>
      <select
        value={persona}
        onChange={(e) => setPersona(e.target.value as PersonaId)}
        style={{ padding: 8, background: "#fff", color: "#111" }}
        className="field"
      >
        <option value="geral">Geral</option>
        <option value="wow">Especialista WoW PvP</option>
      </select>
      <button
        onClick={() => setMessages([])}
        style={{ marginLeft: 8 }}
        className="btn btn-ghost"
      >
        Nova Conversa
      </button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          margin: "16px 0",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#2563eb" : "#e5e7eb",
              color: m.role === "user" ? "#fff" : "#111",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "80%",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div>Pensando...</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte alguma coisa..."
          className="field"
          style={{ flex: 1, padding: 8, background: "#fff", color: "#111" }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="btn btn-primary"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}
