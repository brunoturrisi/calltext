import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div style={{ fontFamily: "system-ui", textAlign: "center", padding: 60, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>☎️ CallText</h1>
      <p style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>Mai più una chiamata persa senza risposta</p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <Link to="/chat/bar-centrale" style={{ padding: "14px 28px", background: "#25D366", color: "white", borderRadius: 30, textDecoration: "none", fontWeight: 600 }}>💬 Demo Chat</Link>
        <Link to="/dashboard/bar-centrale" style={{ padding: "14px 28px", background: "#075E54", color: "white", borderRadius: 30, textDecoration: "none", fontWeight: 600 }}>📊 Dashboard</Link>
        <Link to="/admin" style={{ padding: "14px 28px", background: "#333", color: "white", borderRadius: 30, textDecoration: "none", fontWeight: 600 }}>🛠️ Admin</Link>
      </div>
      <p style={{ marginTop: 40, fontSize: 14, color: "#999" }}>Accedi a /dashboard/negozio con codice 1234</p>
    </div>
  );
}
