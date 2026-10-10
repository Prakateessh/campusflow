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
      // ═══════════════════════════════════════════════════════════
      // GET /api/health
      // ═══════════════════════════════════════════════════════════
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

      // ═══════════════════════════════════════════════════════════
      // GET /api/facilities
      // ═══════════════════════════════════════════════════════════
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

        if (conditions.length) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY category, code';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        const facilities = (result.results ?? []).map((row: any) => ({
          ...row,
          equipment: safeParse(row.equipment),
        }));

        return json({ facilities }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // GET /api/facilities/:id
      // ═══════════════════════════════════════════════════════════
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

      // ═══════════════════════════════════════════════════════════
      // GET /api/requests
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/requests' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        const status = url.searchParams.get('status');

        let sql = `
          SELECT
            r.id, r.kind, r.title, r.status,
            r.scheduled_start, r.scheduled_end, r.created_at, r.approved_at,
            f.id AS facility_id, f.code AS facility_code, f.name AS facility_name,
            u.name AS requester_name
          FROM requests r
          JOIN facilities f ON f.id = r.facility_id
          JOIN users u ON u.id = r.requester_id
        `;
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (userId) {
          conditions.push('r.requester_id = ?');
          params.push(Number(userId));
        }
        if (status) {
          conditions.push('r.status = ?');
          params.push(status);
        }

        if (conditions.length) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY r.created_at DESC';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ requests: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // GET /api/requests/:id
      // ═══════════════════════════════════════════════════════════
      const reqMatch = path.match(/^\/api\/requests\/(\d+)$/);
      if (reqMatch && request.method === 'GET') {
        const reqId = Number(reqMatch[1]);

        const req = await env.campusflow_db
          .prepare(`
            SELECT
              r.*,
              f.id AS facility_id, f.code AS facility_code, f.name AS facility_name,
              f.category AS facility_category,
              u.name AS requester_name, u.email AS requester_email,
              s.name AS sponsor_name, s.email AS sponsor_email, s.department AS sponsor_dept
            FROM requests r
            JOIN facilities f ON f.id = r.facility_id
            JOIN users u ON u.id = r.requester_id
            LEFT JOIN users s ON s.id = r.sponsor_id
            WHERE r.id = ?
          `)
          .bind(reqId)
          .first();

        if (!req) {
          return json({ error: 'Request not found' }, cors, 404);
        }

        const items = await env.campusflow_db
          .prepare(`
            SELECT
              ri.id, ri.item_type, ri.quantity, ri.unit, ri.notes,
              m.name AS menu_item_name, m.price_cents,
              i.name AS inventory_item_name, i.sku
            FROM request_items ri
            LEFT JOIN canteen_menu m ON m.id = ri.menu_item_id
            LEFT JOIN inventory i ON i.id = ri.inventory_id
            WHERE ri.request_id = ?
          `)
          .bind(reqId)
          .all();

        const approvals = await env.campusflow_db
          .prepare(`
            SELECT a.id, a.decision, a.comments, a.decided_at, a.approver_role,
                   u.name AS approver_name
            FROM approvals a
            JOIN users u ON u.id = a.approver_id
            WHERE a.request_id = ?
            ORDER BY a.decided_at ASC
          `)
          .bind(reqId)
          .all();

        return json(
          {
            request: req,
            items: items.results,
            approvals: approvals.results,
          },
          cors,
        );
      }

      // ═══════════════════════════════════════════════════════════
      // CANTEEN — GET /api/canteen/menu
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/canteen/menu' && request.method === 'GET') {
        const facilityId = url.searchParams.get('facility_id') ?? '40';

        const result = await env.campusflow_db
          .prepare(`
            SELECT id, facility_id, name, description, price_cents,
                   prep_time_minutes, category, available, display_order
            FROM canteen_menu
            WHERE facility_id = ? AND available = 1
            ORDER BY display_order, name
          `)
          .bind(Number(facilityId))
          .all();

        return json({ menu: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // CANTEEN — POST /api/canteen/order
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/canteen/order' && request.method === 'POST') {
        const body = await request.json<{
          user_id: number;
          facility_id: number;
          pickup_at: string;
          items: Array<{ menu_item_id: number; quantity: number; notes?: string }>;
        }>();

        if (!body.user_id || !body.facility_id || !body.pickup_at || !body.items?.length) {
          return json({ error: 'Missing required fields' }, cors, 400);
        }

        const menuIds = body.items.map((i) => i.menu_item_id);
        const placeholders = menuIds.map(() => '?').join(',');
        const menuItems = await env.campusflow_db
          .prepare(`
            SELECT id, name, price_cents, prep_time_minutes
            FROM canteen_menu
            WHERE id IN (${placeholders})
          `)
          .bind(...menuIds)
          .all<any>();

        const menuMap = new Map(
          (menuItems.results ?? []).map((m: any) => [m.id, m]),
        );

        const subtotal = body.items.reduce((sum, line) => {
          const m = menuMap.get(line.menu_item_id) as any;
          return sum + (m ? m.price_cents * line.quantity : 0);
        }, 0);
        const gst = Math.round(subtotal * 0.05);
        const total = subtotal + gst;

        const prepMax = Math.max(
          ...body.items.map(
            (line) => (menuMap.get(line.menu_item_id) as any)?.prep_time_minutes ?? 10,
          ),
          10,
        );

        const title =
          body.items.length === 1
            ? `Order — ${body.items[0].quantity}× ${(menuMap.get(body.items[0].menu_item_id) as any)?.name}`
            : `Order — ${body.items.length} items`;

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const insertReq = await env.campusflow_db
          .prepare(`
            INSERT INTO requests
              (kind, requester_id, facility_id, title, description, status,
               scheduled_start, scheduled_end, created_at, submitted_at, approved_at)
            VALUES
              ('canteen', ?, ?, ?, 'Pre-order for pickup', 'scheduled',
               ?, ?, ?, ?, ?)
          `)
          .bind(
            body.user_id,
            body.facility_id,
            title,
            body.pickup_at,
            body.pickup_at,
            now,
            now,
            now,
          )
          .run();

        const requestId = insertReq.meta.last_row_id;

        for (const line of body.items) {
          await env.campusflow_db
            .prepare(`
              INSERT INTO request_items
                (request_id, item_type, menu_item_id, quantity, unit, notes)
              VALUES (?, 'menu_item', ?, ?, 'plate', ?)
            `)
            .bind(
              requestId,
              line.menu_item_id,
              line.quantity,
              line.notes ?? null,
            )
            .run();
        }

        const maxQueue = await env.campusflow_db
          .prepare(`SELECT COALESCE(MAX(queue_position), 0) AS max_q FROM canteen_orders`)
          .first<{ max_q: number }>();
        const queuePosition = (maxQueue?.max_q ?? 0) + 1;

        const pickupDate = new Date(body.pickup_at.replace(' ', 'T'));
        const prepStart = new Date(pickupDate.getTime() - prepMax * 60_000);
        const prepStartStr = prepStart.toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            INSERT INTO canteen_orders
              (request_id, pickup_at, paid_at, payment_reference,
               queue_position, prep_started_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(
            requestId,
            body.pickup_at,
            now,
            `UPI-DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            queuePosition,
            prepStartStr,
          )
          .run();

        return json(
          {
            success: true,
            request_id: requestId,
            queue_position: queuePosition,
            total_cents: total,
            prep_start: prepStartStr,
            pickup_at: body.pickup_at,
          },
          cors,
          201,
        );
      }

      // ═══════════════════════════════════════════════════════════
      // CANTEEN — GET /api/canteen/order/:id
      // ═══════════════════════════════════════════════════════════
      const canteenOrderMatch = path.match(/^\/api\/canteen\/order\/(\d+)$/);
      if (canteenOrderMatch && request.method === 'GET') {
        const requestId = Number(canteenOrderMatch[1]);

        const order = await env.campusflow_db
          .prepare(`
            SELECT co.*, r.title, r.status, u.name AS requester_name
            FROM canteen_orders co
            JOIN requests r ON r.id = co.request_id
            JOIN users u ON u.id = r.requester_id
            WHERE co.request_id = ?
          `)
          .bind(requestId)
          .first();

        if (!order) {
          return json({ error: 'Order not found' }, cors, 404);
        }

        return json({ order }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // CANTEEN — GET /api/canteen/queue
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/canteen/queue' && request.method === 'GET') {
        const queue = await env.campusflow_db
          .prepare(`
            SELECT co.request_id, co.queue_position, co.pickup_at, co.prep_started_at,
                   r.title, u.name AS requester_name
            FROM canteen_orders co
            JOIN requests r ON r.id = co.request_id
            JOIN users u ON u.id = r.requester_id
            WHERE co.prep_completed_at IS NULL
            ORDER BY co.queue_position ASC
            LIMIT 20
          `)
          .all();

        return json({ queue: queue.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // LIBRARY — GET /api/library/books
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/books' && request.method === 'GET') {
        const query = url.searchParams.get('q');
        const filter = url.searchParams.get('filter');

        let sql = `
          SELECT id, isbn, title, author, total_copies, available_copies, shelf_code
          FROM library_books
        `;
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (query) {
          conditions.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ?)');
          const like = `%${query}%`;
          params.push(like, like, like);
        }
        if (filter === 'available') {
          conditions.push('available_copies > 0');
        } else if (filter === 'out') {
          conditions.push('available_copies = 0');
        }

        if (conditions.length) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY title';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ books: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // LIBRARY — POST /api/library/renew
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/renew' && request.method === 'POST') {
        const body = await request.json<{ user_id: number; book_id: number }>();

        if (!body.user_id || !body.book_id) {
          return json({ error: 'Missing required fields' }, cors, 400);
        }

        const book = await env.campusflow_db
          .prepare('SELECT * FROM library_books WHERE id = ?')
          .bind(body.book_id)
          .first<any>();

        if (!book) {
          return json({ error: 'Book not found' }, cors, 404);
        }

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const due = new Date();
        due.setDate(due.getDate() + 14);
        const dueStr = due.toISOString().replace('T', ' ').slice(0, 19);

        const insertReq = await env.campusflow_db
          .prepare(`
            INSERT INTO requests
              (kind, requester_id, facility_id, title, description, status,
               scheduled_start, created_at, submitted_at, approved_at)
            VALUES
              ('library', ?, 6, ?, 'Renewed for 14 days', 'completed',
               ?, ?, ?, ?)
          `)
          .bind(
            body.user_id,
            `Renewal — ${book.title}`,
            dueStr,
            now,
            now,
            now,
          )
          .run();

        const requestId = insertReq.meta.last_row_id;

        await env.campusflow_db
          .prepare(`
            INSERT INTO request_items
              (request_id, item_type, quantity, unit, notes)
            VALUES (?, 'inventory', 1, 'book', ?)
          `)
          .bind(requestId, `${book.title} by ${book.author}`)
          .run();

        return json(
          {
            success: true,
            request_id: requestId,
            due_date: dueStr,
            days: 14,
          },
          cors,
          201,
        );
      }

      // ═══════════════════════════════════════════════════════════
      // AI ASSISTANT — POST /api/ai/chat
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/ai/chat' && request.method === 'POST') {
        const body = await request.json<{ message: string; context?: string }>();
        const message = (body.message ?? '').trim();

        if (!message) {
          return json({ error: 'Empty message' }, cors, 400);
        }
        if (message.length > 2000) {
          return json({ error: 'Message too long' }, cors, 400);
        }

        const facilities = await env.campusflow_db
          .prepare(`
            SELECT code, name, category,
                   substr(description, 1, 120) AS description
            FROM facilities
            ORDER BY category, code
          `)
          .all();

        const facilityList = (facilities.results ?? [])
          .map((f: any) => `${f.code} | ${f.name} | ${f.category} | ${f.description}`)
          .join('\n');

        const systemPrompt = `You are CampusFlow Assistant for Amrita Vishwa Vidyapeetham, Ettimadai campus.

You help students, faculty, and staff find facilities, equipment, and services.

FACILITIES AVAILABLE:
${facilityList}

SERVICES:
- Lab access (equipment, components, supervised slots) — requires faculty sponsor
- Canteen (pre-order meals, pickup slot)
- Library (search, renew books)
- Sports (borrow rackets, balls, gear)
- Stores (reserve stationery, essentials)

RULES:
1. Reply in plain English. Be direct.
2. If the user asks about a specific facility, name it with its code (e.g., "Embedded Computing Laboratory (E-09)").
3. If the user wants to book, tell them to use the "Request access" button on the facility page.
4. Keep replies under 4 sentences unless the user asks for detail.
5. Do not invent equipment, contacts, or facilities. Only reference what's listed above.
6. If nothing matches, say so and suggest the closest alternative.`;

        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 400,
          temperature: 0.3,
        });

        const reply =
          typeof aiResponse === 'string'
            ? aiResponse
            : (aiResponse as any)?.response ?? 'I could not generate a response.';

        return json({ reply }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // 404
      // ═══════════════════════════════════════════════════════════
      return json({ error: 'Not found', path }, cors, 404);
    } catch (err: any) {
      return json(
        {
          error: 'Internal error',
          message: err?.message ?? String(err),
        },
        cors,
        500,
      );
    }
  },
};

function json(
  body: unknown,
  cors: Record<string, string>,
  status = 200,
): Response {
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