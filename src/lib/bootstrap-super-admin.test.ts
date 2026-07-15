import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleBootstrapSuperAdmin } from "@/lib/bootstrap-super-admin.server";

const TOKEN = "test-token-abcdefghijklmnop";
const EMAIL = "admin@example.com";
const USER_ID = "11111111-1111-1111-1111-111111111111";

interface State {
  superAdminCount: number;
  users: Array<{ id: string; email: string }>;
  auditRows: Array<Record<string, unknown>>;
  insertedRoles: Array<Record<string, unknown>>;
  insertError?: { message: string } | null;
}

function makeAdmin(state: State) {
  const inserts = {
    user_roles: (row: Record<string, unknown>) => {
      if (state.insertError) return { error: state.insertError };
      state.insertedRoles.push(row);
      state.superAdminCount += 1;
      return { error: null };
    },
    bootstrap_audit: (row: Record<string, unknown>) => {
      state.auditRows.push(row);
      return { error: null };
    },
  };

  return {
    from(table: keyof typeof inserts) {
      return {
        select(_cols: string, opts: { count: string; head: boolean }) {
          void opts;
          return {
            eq: async (_col: string, val: string) => {
              if (table === "user_roles" && val === "super_admin") {
                return { count: state.superAdminCount, error: null };
              }
              return { count: 0, error: null };
            },
          };
        },
        insert: async (row: Record<string, unknown>) => inserts[table](row),
      };
    },
    auth: {
      admin: {
        listUsers: async ({ page }: { page: number; perPage: number }) => {
          if (page > 1) return { data: { users: [] }, error: null };
          return { data: { users: state.users }, error: null };
        },
      },
    },
  } as any;
}

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/public/bootstrap/super-admin", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("bootstrap super-admin endpoint", () => {
  let state: State;

  beforeEach(() => {
    state = {
      superAdminCount: 0,
      users: [{ id: USER_ID, email: EMAIL }],
      auditRows: [],
      insertedRoles: [],
      insertError: null,
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 503 when the deployment token is not configured", async () => {
    const res = await handleBootstrapSuperAdmin(req({ token: TOKEN, email: EMAIL }), {
      admin: makeAdmin(state),
      expectedToken: undefined,
    });
    expect(res.status).toBe(503);
  });

  it("rejects invalid request bodies with 400", async () => {
    const res = await handleBootstrapSuperAdmin(req({ token: "short", email: "nope" }), {
      admin: makeAdmin(state),
      expectedToken: TOKEN,
    });
    expect(res.status).toBe(400);
  });

  it("rejects a wrong deployment token with 401", async () => {
    const res = await handleBootstrapSuperAdmin(
      req({ token: "wrong-token-xxxxxxxxxxxxxx", email: EMAIL }),
      { admin: makeAdmin(state), expectedToken: TOKEN },
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when no matching auth user exists", async () => {
    state.users = [];
    const res = await handleBootstrapSuperAdmin(req({ token: TOKEN, email: EMAIL }), {
      admin: makeAdmin(state),
      expectedToken: TOKEN,
    });
    expect(res.status).toBe(404);
  });

  it("grants SUPER_ADMIN to the first bootstrap request and records an audit row", async () => {
    const admin = makeAdmin(state);
    const res = await handleBootstrapSuperAdmin(
      req(
        { token: TOKEN, email: EMAIL },
        { "user-agent": "vitest", "x-forwarded-for": "10.0.0.1" },
      ),
      { admin, expectedToken: TOKEN },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; user_id: string };
    expect(body.ok).toBe(true);
    expect(body.user_id).toBe(USER_ID);

    expect(state.insertedRoles).toEqual([{ user_id: USER_ID, role: "super_admin" }]);
    expect(state.auditRows).toHaveLength(1);
    expect(state.auditRows[0]).toMatchObject({
      event: "super_admin_bootstrapped",
      actor_email: EMAIL,
      actor_user_id: USER_ID,
      ip: "10.0.0.1",
      user_agent: "vitest",
    });
  });

  it("rejects a second bootstrap attempt with 410 Gone and does not write an audit row", async () => {
    state.superAdminCount = 1; // simulate a previously-completed bootstrap
    const res = await handleBootstrapSuperAdmin(req({ token: TOKEN, email: EMAIL }), {
      admin: makeAdmin(state),
      expectedToken: TOKEN,
    });
    expect(res.status).toBe(410);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/already completed/i);
    expect(state.insertedRoles).toHaveLength(0);
    expect(state.auditRows).toHaveLength(0);
  });

  it("is idempotent end-to-end: first call succeeds, second call is 410", async () => {
    const admin = makeAdmin(state);
    const first = await handleBootstrapSuperAdmin(req({ token: TOKEN, email: EMAIL }), {
      admin,
      expectedToken: TOKEN,
    });
    expect(first.status).toBe(200);

    const second = await handleBootstrapSuperAdmin(req({ token: TOKEN, email: EMAIL }), {
      admin,
      expectedToken: TOKEN,
    });
    expect(second.status).toBe(410);
    expect(state.auditRows).toHaveLength(1);
    expect(state.insertedRoles).toHaveLength(1);
  });
});
