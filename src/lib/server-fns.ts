import { createServerFn } from "@tanstack/react-start";
import { query } from "./db";

export const getBusinessInfo = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const result = query<{ id: string; slug: string; name: string; is_active: number }>(
      `SELECT id, slug, name, is_active FROM businesses WHERE slug = '${slug}' LIMIT 1`
    );
    return result.length ? result[0] : null;
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((data: { sessionId?: string; businessSlug: string; message: string; callerName?: string }) => data)
  .handler(async ({ data }) => {
    const { sessionId, businessSlug, message, callerName } = data;
    const bizResult = query<{ name: string }>(`SELECT name FROM businesses WHERE slug = '${businessSlug}' LIMIT 1`);
    const businessName = bizResult[0]?.name || businessSlug;
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = query<{ id: string }>(
        `INSERT INTO chat_sessions (business_slug, caller_name, status) VALUES ('${businessSlug}', ${callerName ? `'${callerName}'` : "NULL"}, 'active') RETURNING id`
      );
      currentSessionId = newSession[0]?.id;
    }
    query(`INSERT INTO chat_messages (session_id, role, content) VALUES ('${currentSessionId}', 'user', '${message}')`);

    const lower = message.toLowerCase();
    let aiResponse = "";
    if (lower.includes("orario") || lower.includes("aperto")) aiResponse = `I nostri orari: Lun-Ven 8:00-20:00, Sab 9:00-18:00, Dom chiuso.`;
    else if (lower.includes("prenot") || lower.includes("appuntamento")) aiResponse = `Certamente! Mi dica nome e telefono e per quando desidera prenotare.`;
    else if (lower.includes("preventiv") || lower.includes("costo") || lower.includes("prezzo")) aiResponse = `La contatteremo con un preventivo personalizzato.`;
    else if (lower.includes("dove") || lower.includes("indirizzo")) aiResponse = `Ci trovate in Via Roma 123, 20100 Milano.`;
    else if (lower.includes("titolare") || lower.includes("proprietario")) aiResponse = `Il titolare e' disponibile su appuntamento. Vuole che lo contatti?`;
    else if (lower.includes("ciao") || lower.includes("salve") || lower.includes("buongiorno")) aiResponse = `Buongiorno! Come possiamo aiutarla oggi?`;
    else if (lower.includes("grazie")) aiResponse = `Di nulla! Se ha altre domande, sono qui per aiutarla.`;
    else aiResponse = `Grazie per il messaggio! Un collaboratore la contattera' al piu' presto.`;

    query(`INSERT INTO chat_messages (session_id, role, content) VALUES ('${currentSessionId}', 'ai', '${aiResponse}')`);
    query(`UPDATE chat_sessions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = '${currentSessionId}'`);

    if (lower.includes("prenot") || lower.includes("appuntamento") || lower.includes("preventiv")) {
      query(`INSERT INTO leads (business_slug, interest, status) VALUES ('${businessSlug}', '${message}', 'new')`);
    }
    return { sessionId: currentSessionId, message: aiResponse, businessName };
  });

export const escalateChat = createServerFn({ method: "POST" })
  .validator((data: { sessionId?: string; businessSlug: string }) => data)
  .handler(async ({ data }) => {
    const { sessionId, businessSlug } = data;
    if (sessionId) {
      query(`UPDATE chat_sessions SET status = 'escalated', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = '${sessionId}'`);
      query(`INSERT INTO chat_messages (session_id, role, content) VALUES ('${sessionId}', 'system', 'Escalation attivata')`);
    }
    query(`INSERT INTO leads (business_slug, interest, status) VALUES ('${businessSlug}', 'Richiede operatore umano', 'urgent')`);
    return { success: true };
  });

export const getMissedCalls = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const calls = query(`SELECT id, caller_number, status, created_at FROM call_logs WHERE business_slug = '${slug}' ORDER BY created_at DESC LIMIT 50`);
    return { calls };
  });

export const getConversations = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sessions = query(`SELECT id, caller_name, caller_number, status, created_at, updated_at FROM chat_sessions WHERE business_slug = '${slug}' ORDER BY updated_at DESC LIMIT 50`);
    return sessions.map((s: any) => {
      const msgs = query(`SELECT role, content, created_at FROM chat_messages WHERE session_id = '${s.id}' ORDER BY created_at DESC LIMIT 1`);
      return { ...s, lastMessage: msgs[0]?.content || "", lastMessageRole: msgs[0]?.role || "" };
    });
  });

export const getLeads = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return query(`SELECT id, name, phone, interest, status, notes, created_at FROM leads WHERE business_slug = '${slug}' ORDER BY created_at DESC LIMIT 100`);
  });

export const authBusiness = createServerFn({ method: "POST" })
  .validator((data: { slug: string; accessCode: string }) => data)
  .handler(async ({ data }) => {
    const result = query(`SELECT id, name, access_code FROM businesses WHERE slug = '${data.slug}' AND is_active = 1 LIMIT 1`);
    if (!result.length) return { error: "Business not found" };
    if ((result[0] as any).access_code !== data.accessCode) return { error: "Codice di accesso errato" };
    return { success: true, name: (result[0] as any).name };
  });
