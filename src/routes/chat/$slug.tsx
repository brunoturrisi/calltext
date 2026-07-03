import { useState, useEffect, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { getBusinessInfo, sendChatMessage, escalateChat } from "~/lib/server-fns";

export const Route = createFileRoute("/chat/$slug")({ component: ChatPage });

function ChatPage() {
  const { slug } = Route.useParams();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [businessName, setBusinessName] = useState("Caricamento...");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    getBusinessInfo({ data: slug }).then((biz) => {
      if (biz) setBusinessName(biz.name);
    });
  }, [slug]);

  const quickReplies = [
    "Orari di apertura",
    "Dove siete?",
    "Vorrei prenotare",
    "Quanto costa?",
    "Parlare con il titolare",
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await sendChatMessage({ data: { sessionId, businessSlug: slug, message: text } });
      setSessionId(res.sessionId);
      setMessages((prev) => [...prev, { role: "ai", content: res.message }]);
    } catch { setMessages((prev) => [...prev, { role: "ai", content: "Mi dispiace, errore di connessione." }]); }
    setLoading(false);
  };

  const handleEscalate = async () => {
    if (escalated) return;
    setEscalated(true);
    setMessages((prev) => [...prev, { role: "user", content: "Voglio parlare con un operatore" }]);
    try {
      await escalateChat({ data: { sessionId, businessSlug: slug } });
      setMessages((prev) => [...prev, { role: "ai", content: "La metto in contatto con un operatore. Riceverai una risposta a breve. Grazie per la pazienza!" }]);
    } catch {}
  };

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f2f5", padding: 20, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, maxWidth: 400, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>{businessName}</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>Assistente virtuale</p>
          <button onClick={() => setStarted(true)} style={{ background: "#25D366", color: "white", border: "none", padding: "14px 32px", borderRadius: 30, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Inizia chat
          </button>
          <p style={{ fontSize: 12, color: "#999", marginTop: 16 }}>Chat gestita da AI • Richiedi operatore umano quando vuoi</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#075E54", color: "white", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
        <div><div style={{ fontWeight: 600 }}>{businessName}</div><div style={{ fontSize: 12, opacity: 0.8 }}>Online</div></div>
      </div>

      {messages.length === 0 && (
        <div style={{ padding: "12px 16px", background: "#e8f5e9", textAlign: "center", fontSize: 13, color: "#2e7d32" }}>
          👋 Ciao! Sono l'assistente di {businessName}. Come posso aiutarti?
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#e5ddd5", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 12, background: msg.role === "user" ? "#DCF8C6" : "white", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", fontSize: 15, lineHeight: "1.4" }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ padding: "10px 14px", borderRadius: 12, background: "white", fontSize: 15 }}>✏️ Sta scrivendo...</div></div>}
        <div ref={bottomRef} />
      </div>

      {!escalated && (
        <div style={{ padding: "8px 12px", background: "white", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #eee" }}>
          {quickReplies.map((qr) => (
            <button key={qr} onClick={() => sendMessage(qr)} disabled={loading} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #ddd", background: "white", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              {qr}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "8px 12px 12px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} placeholder="Scrivi un messaggio..." style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "1px solid #ddd", fontSize: 15, outline: "none" }} />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: loading ? "#ccc" : "#25D366", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
      </div>

      {!escalated && (
        <div style={{ textAlign: "center", padding: 8, background: "#f8f9fa", borderTop: "1px solid #eee" }}>
          <button onClick={handleEscalate} style={{ border: "none", background: "none", color: "#666", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            👤 Parlare con un operatore umano
          </button>
        </div>
      )}
    </div>
  );
}
