import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { query } from "~/lib/db";
import { createServerFn } from "@tanstack/react-start";

const getAllBusinesses = createServerFn({ method: "GET" }).handler(async () => {
  return query(`SELECT id, slug, name, is_active, created_at FROM businesses ORDER BY created_at DESC`);
});

const getAllLeads = createServerFn({ method: "GET" }).handler(async () => {
  return query(`SELECT l.id, l.business_slug, l.name, l.interest, l.status, l.created_at, b.name as business_name FROM leads l LEFT JOIN businesses b ON b.slug = l.business_slug ORDER BY l.created_at DESC LIMIT 200`);
});

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [tab, setTab] = useState<"businesses" | "leads">("businesses");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    getAllBusinesses().then(setBusinesses);
    getAllLeads().then(setLeads);
  }, []);

  const handleCreate = async () => {
    if (!newName || !newSlug) return;
    await query(`INSERT INTO businesses (slug, name) VALUES ('${newSlug}', '${newName}')`);
    setNewName(""); setNewSlug("");
    getAllBusinesses().then(setBusinesses);
  };

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>🛠️ CallText Admin</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab("businesses")} style={{ padding: "10px 20px", borderRadius: 8, border: tab === "businesses" ? "2px solid #075E54" : "1px solid #ddd", background: tab === "businesses" ? "#e8f5e9" : "white", cursor: "pointer", fontWeight: tab === "businesses" ? 600 : 400 }}>🏪 Negozi ({businesses.length})</button>
        <button onClick={() => setTab("leads")} style={{ padding: "10px 20px", borderRadius: 8, border: tab === "leads" ? "2px solid #075E54" : "1px solid #ddd", background: tab === "leads" ? "#e8f5e9" : "white", cursor: "pointer", fontWeight: tab === "leads" ? 600 : 400 }}>⭐ Lead ({leads.length})</button>
      </div>

      {tab === "businesses" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome negozio" style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
            <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug (es. bar-centrale)" style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
            <button onClick={handleCreate} style={{ padding: "10px 20px", background: "#075E54", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>➕ Aggiungi</button>
          </div>
          {businesses.map((b: any) => (
            <div key={b.id} style={{ padding: "12px 16px", background: "white", borderRadius: 8, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div><strong>{b.name}</strong> <span style={{ color: "#999", fontSize: 13 }}>/{b.slug}</span></div>
              <div style={{ fontSize: 13, color: b.is_active ? "green" : "red" }}>{b.is_active ? "Attivo" : "Inattivo"}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "leads" && (
        <div>
          {leads.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Nessun lead</p>}
          {leads.map((l: any) => (
            <div key={l.id} style={{ padding: "12px 16px", background: "white", borderRadius: 8, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div><strong>{l.business_name || l.business_slug}</strong> · {l.name || "Anonimo"}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{l.interest?.slice(0, 120)}</div>
              <div style={{ fontSize: 12, color: "#999" }}>Stato: {l.status} · {new Date(l.created_at).toLocaleString("it-IT")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
