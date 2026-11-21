"use client";

import { useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const suggestions = [
  "Jakie dokumenty potrzebuję do zasiłku macierzyńskiego?",
  "Oblicz różnicę dla umowy o pracę i zlecenia",
  "Kiedy mogę złożyć wniosek o urlop rodzicielski?",
  "Co zrobić po wcześniejszym porodzie?",
];

function normalizeAiMarkdown(text: string): string {
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(/\*{3,}(?=[^*])/g, "**")
    .replace(/^[\t ]{2,}(?=\d+[.)]\s)/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\t ]*[-•][\t ]+/gm, "- ")
    .replace(/^\*\*([^*\n]+)\*\*$/gm, "## $1")
    .trim();
}

export default function AssistantPage() {
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Witaj! Jestem asystentem ZUS Nawigator. Mogę wyjaśnić świadczenia, pomóc dobrać formularze i wskazać ryzyka. O jakiej sytuacji chcesz porozmawiać?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("local-ai");
  const [sources, setSources] = useState<string[]>([]);
  const messagesEnd = useRef<HTMLDivElement>(null);

  async function askChat(questionText?: string) {
    const question = (questionText ?? chat).trim();
    if (!question || loading) return;

    setMessages((current) => [...current, { role: "user", text: question }]);
    setChat("");
    setLoading(true);

    const history = messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.text,
    }));

    try {
      const response = await fetch("http://localhost:4000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
      });
      if (!response.ok) throw new Error("Nie udało się uzyskać odpowiedzi");

      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
      setMode(data.mode ?? "local-ai");
      setSources(Array.isArray(data.sources) ? data.sources : []);
      if (data.warning) setSources((current) => [...current, data.warning]);
    } catch (error: unknown) {
      setMode("offline");
      setSources([error instanceof Error ? error.message : "Brak połączenia z asystentem"]);
      setMessages((current) => [...current, {
        role: "assistant",
        text: "Nie mogę teraz połączyć się z API lub serwerem LM Studio. Sprawdź, czy backend działa na porcie 4000 i model GPT-OSS 20B jest uruchomiony w LM Studio.",
      }]);
    } finally {
      setLoading(false);
      window.setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <main>
      <AppHeader active="/asystent" />
      <section className="tab-page assistant-page">
        <div className="tab-heading">
          <div><p className="eyebrow">ASYSTENT ZUS</p><h1>Zadaj pytanie</h1></div>
          <span className={`online ${mode === "fallback" || mode === "offline" ? "warning" : ""}`}>
            ● {mode === "fallback" || mode === "offline" ? "Tryb awaryjny" : "GPT-OSS 20B"}
          </span>
        </div>

        <section className="card assistant-chat">
          <div className="messages" aria-live="polite">
            {messages.map((message, i) => (
              <div key={i} className={`message ${message.role}`}>
                <span>{message.role === "assistant" ? "AI" : "AK"}</span>
                {message.role === "assistant" ? (
                  <div className="message-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                      }}
                    >{normalizeAiMarkdown(message.text)}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
            ))}
            {loading && <div className="message assistant"><span>AI</span><p className="typing"><i /><i /><i /></p></div>}
            <div ref={messagesEnd} />
          </div>

          {sources.length > 0 && (
            <div className="chat-sources">
              <small>ŹRÓDŁA / STATUS</small>
              {sources.map((source) => <span key={source}>{source}</span>)}
            </div>
          )}

          {messages.length === 1 && (
            <div className="suggestions" aria-label="Sugerowane pytania">
              <small>MOŻESZ ZAPYTAĆ O</small>
              {suggestions.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => askChat(suggestion)}>{suggestion}</button>
              ))}
            </div>
          )}

          <form className="prompt" onSubmit={(event) => { event.preventDefault(); askChat(); }}>
            <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Napisz pytanie o świadczenia, dokumenty lub termin…" aria-label="Pytanie do asystenta ZUS" />
            <button type="submit" disabled={loading || !chat.trim()} aria-label="Wyślij pytanie">➤</button>
          </form>
        </section>
      </section>
    </main>
  );
}
