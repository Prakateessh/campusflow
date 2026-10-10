export interface Env {
  campusflow_db: D1Database;
  AI: Ai;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      // ── GET /api/health ──
      if (path === '/api/health' && request.method === 'GET') {
        const result = await env.campusflow_db
          .prepare('SELECT COUNT(*) AS count FROM facilities')
          .first<{ count: number }>();

        return json(
          {
            status: 'ok',
            environment: env.ENVIRONMENT,
            facilities: result?.count ?? 0,
            time: new Date().toISOString(),
          },
          cors,
        );
      }

      // ── GET /api/facilities ──
      if (path === '/api/facilities' && request.method === 'GET') {
        const category = url.searchParams.get('category');
        const query = url.searchParams.get('q');

        let sql = `
          SELECT id, code, name, category, kind, description, contact,
                 equipment, location, capacity, open_hours, status
          FROM facilities
        `;
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (category) {
          conditions.push('category = ?');
          params.push(category);
        }
        if (query) {
          conditions.push('(name LIKE ? OR code LIKE ? OR description LIKE ?)');
          const like = `%${query}%`;
          params.push(like, like, like);
        }
        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY category, code';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        // Parse equipment JSON for each row
        const facilities = (result.results ?? []).map((row: any) => ({
          ...row,
          equipment: safeParse(row.equipment),
        }));

        return json({ facilities }, cors);
      }

      // ── GET /api/facilities/:id ──
      const facilityMatch = path.match(/^\/api\/facilities\/(\d+)$/);
      if (facilityMatch && request.method === 'GET') {
        const id = Number(facilityMatch[1]);

        const facility = await env.campusflow_db
          .prepare('SELECT * FROM facilities WHERE id = ?')
          .bind(id)
          .first<any>();

        if (!facility) {
          return json({ error: 'Facility not found' }, cors, 404);
        }

        facility.equipment = safeParse(facility.equipment);

        return json({ facility }, cors);
      }

      return json({ error: 'Not found', path }, cors, 404);
    } catch (err: any) {
      return json(
        { error: 'Internal error', message: err?.message ?? String(err) },
        cors,
        500,
      );
    }
  },
};

function json(body: unknown, cors: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function safeParse(value: unknown): unknown {
  if (typeof value !== 'string') return value ?? [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}