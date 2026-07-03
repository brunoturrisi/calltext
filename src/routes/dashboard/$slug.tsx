import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authBusiness, getMissedCalls, getConversations, getLeads } from "~/lib/server-fns";

export const Route = createFileRoute("/dashboard/$slug")({ component: DashboardPage });

function DashboardPage() {
  const { slug } = Route.useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"calls" | "chats" | "leads">("calls");
  const [calls, setCalls] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("");

  const handleLogin = async () => {
    setError("");
    const res = await authBusiness({ data: { slug, accessCode } });
    if (res.error) setError(res.error);
    else { setAuthenticated(true); setBusinessName(res.name); }
  };

  useEffect(() => {
    if (!authenticated) return;
    getMissedCalls({ data: slug }).then((d) => setCalls(d.calls));
    getConversations({ data: slug }).then(setChats);
    getLeads({ data: slug }).then(setLeads);
  }, [authenticated, slug]);

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", fontFamily: "system-ui" }}>
        <div style={{ background: "white", padding: 40, borderRadius: 16, maxWidth: 360, width: "90%", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ margin: "0 0 8px" }}>🔐 Accesso</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>Inserisci il codice di accesso per {slug}</p>
          <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Codice" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 16, marginBottom: 12, boxSizing: "border-box" }} />
          {error && <p style={{ color: "red", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 12, background: "#075E54", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Entra</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "calls" as const, label: "📞 Chiamate", count: calls.length },
    { key: "chats" as const, label: "💬 Chat", count: chats.length },
    { key: "leads" as const, label: "⭐ Lead", count: leads.length },
  ];

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>📊 {businessName}</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: tab === t.key ? "2px solid #075E54" : "1px solid #ddd", background: tab === t.key ? "#e8f5e9" : "white", fontWeight: tab === t.key ? 600 : 400, cursor: "pointer" }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "calls" && (
        <div>
          {calls.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Nessuna chiamata persa</p>}
          {calls.map((c: any) => (
            <div key={c.id} style={{ padding: "12px 16px", background: "white", borderRadius: 8, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: 600 }}>{c.caller_number}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{new Date(c.created_at).toLocaleString("it-IT")}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <div>
          {chats.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Nessuna chat</p>}
          {chats.map((s: any) => (
            <div key={s.id} style={{ padding: "12px 16px", background: "white", borderRadius: 8, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: 600 }}>{s.caller_name || s.caller_number || "Anonimo"}</div>
              <div style={{ fontSize: 13, color: "#666" }}>Ultimo: {s.lastMessage?.slice(0, 60)}</div>
              <div style={{ fontSize: 12, color: s.status === "active" ? "green" : "#999" }}>{s.status === "active" ? "In corso" : s.status === "escalated" ? "Con operatore" : "Chiusa"}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "leads" && (
        <div>
          {leads.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Nessun lead</p>}
          {leads.map((l: any) => (
            <div key={l.id} style={{ padding: "12px 16px", background: "white", borderRadius: 8, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: 600 }}>{l.name || "Anonimo"}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{l.interest?.slice(0, 100)}</div>
              <div style={{ fontSize: 12, color: "#999" }}>Stato: {l.status} · {new Date(l.created_at).toLocaleString("it-IT")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
