import { execSync } from "node:child_process";

function findTeamDb(): string {
  const paths = [
    "/home/agent-lead/.local/bin/team-db",
    "/home/agent-backend-engineer/.local/bin/team-db",
    "/usr/local/bin/team-db",
    "/usr/bin/team-db",
  ];
  for (const p of paths) {
    try {
      execSync(`${p} "SELECT 1"`, { encoding: "utf8", timeout: 5000 });
      return p;
    } catch {}
  }
  return "team-db";
}

const TEAM_DB = findTeamDb();

export function query<T = Record<string, unknown>>(sql: string): T[] {
  const escaped = sql.replace(/'/g, "'\\''");
  const output = execSync(`${TEAM_DB} '${escaped}'`, {
    encoding: "utf8", timeout: 60000,
  });
  return JSON.parse(output) as T[];
}

export function insert(table: string, data: Record<string, string | number | null>): string {
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data)
    .map((v) => {
      if (v === null) return "NULL";
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    })
    .join(", ");
  const sql = `INSERT INTO ${table} (id, ${columns}) VALUES (lower(hex(randomblob(16))), ${values}) RETURNING id`;
  const result = query<{ id: string }>(sql);
  return result[0]?.id ?? "";
}
