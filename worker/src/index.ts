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
      //   ?kind=lab|sports|canteen|store|library|all  (default: lab)
      //   ?category=...
      //   ?q=...
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/facilities' && request.method === 'GET') {
        const kind = url.searchParams.get('kind') ?? 'lab';
        const category = url.searchParams.get('category');
        const query = url.searchParams.get('q');

        let sql = `
          SELECT id, code, name, category, kind, description, contact,
                 equipment, location, capacity, open_hours, status
          FROM facilities
          WHERE 1=1
        `;
        const params: unknown[] = [];

        if (kind !== 'all') {
          sql += ' AND kind = ?';
          params.push(kind);
        }
        if (category) {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (query) {
          sql += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
          const like = `%${query}%`;
          params.push(like, like, like);
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
      // GET /api/inventory?facility_id=X
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/inventory' && request.method === 'GET') {
        const facilityId = url.searchParams.get('facility_id');
        if (!facilityId) {
          return json({ error: 'facility_id is required' }, cors, 400);
        }

        const result = await env.campusflow_db
          .prepare(`
            SELECT id, sku, name, kind, quantity_total, quantity_available,
                   unit, requires_return, return_days, notes
            FROM inventory
            WHERE facility_id = ? AND quantity_available > 0
            ORDER BY name
          `)
          .bind(Number(facilityId))
          .all();

        return json({ items: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // GET /api/requests?user_id=X&status=Y
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/requests' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        const status = url.searchParams.get('status');

        if (!userId) {
          return json({ error: 'user_id is required' }, cors, 400);
        }

        let sql = `
          SELECT
            r.id, r.kind, r.title, r.status,
            r.purpose, r.return_by,
            r.scheduled_start, r.scheduled_end,
            r.created_at, r.approved_at,
            f.id AS facility_id,
            f.code AS facility_code,
            f.name AS facility_name,
            u.name AS requester_name
          FROM requests r
          LEFT JOIN facilities f ON f.id = r.facility_id
          JOIN users u ON u.id = r.requester_id
          WHERE r.requester_id = ?
        `;
        const params: unknown[] = [Number(userId)];

        if (status) {
          sql += ' AND r.status = ?';
          params.push(status);
        }
        sql += ' ORDER BY r.created_at DESC';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ requests: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // POST /api/requests
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/requests' && request.method === 'POST') {
        const body = await request.json<{
          kind: 'lab' | 'canteen' | 'library' | 'sports' | 'store';
          requester_id: number;
          sponsor_id?: number;
          facility_id?: number;
          title: string;
          description?: string;
          purpose?: string;
          return_by?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          items?: Array<{
            item_type: string;
            inventory_id?: number;
            quantity: number;
            unit?: string;
            notes?: string;
          }>;
        }>();

        if (!body.kind || !body.requester_id || !body.title) {
          return json(
            { error: 'Missing kind, requester_id, or title' },
            cors,
            400,
          );
        }

        if (body.kind === 'lab') {
          if (!body.purpose || body.purpose.trim().length < 15) {
            return json(
              { error: 'Purpose is required (min 15 characters) for lab requests' },
              cors,
              400,
            );
          }
          if (!body.sponsor_id) {
            return json(
              { error: 'Faculty sponsor is required for lab requests' },
              cors,
              400,
            );
          }
          if (!body.items || body.items.length === 0) {
            return json(
              { error: 'At least one item is required for lab requests' },
              cors,
              400,
            );
          }
        }

        const hasBorrowableItem = (body.items ?? []).some(
          (i) => i.item_type === 'inventory' || i.item_type === 'sports_equipment',
        );
        if (hasBorrowableItem && !body.return_by) {
          return json(
            { error: 'Return by date is required for borrowed items' },
            cors,
            400,
          );
        }

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const status =
          body.kind === 'lab'       ? 'submitted'
          : body.kind === 'library' ? 'completed'
          : 'scheduled';

        const insertReq = await env.campusflow_db
          .prepare(`
            INSERT INTO requests
              (kind, requester_id, sponsor_id, facility_id, title, description,
               purpose, return_by, status,
               scheduled_start, scheduled_end, created_at, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            body.kind,
            body.requester_id,
            body.sponsor_id ?? null,
            body.facility_id ?? null,
            body.title,
            body.description ?? null,
            body.purpose ?? null,
            body.return_by ?? null,
            status,
            body.scheduled_start ?? null,
            body.scheduled_end ?? null,
            now,
            now,
          )
          .run();

        const requestId = insertReq.meta.last_row_id;

        for (const item of body.items ?? []) {
          await env.campusflow_db
            .prepare(`
              INSERT INTO request_items
                (request_id, item_type, inventory_id, quantity, unit, notes)
              VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
              requestId,
              item.item_type,
              item.inventory_id ?? null,
              item.quantity,
              item.unit ?? 'piece',
              item.notes ?? null,
            )
            .run();

          // Decrement stock for inventory-backed items
          if (
            item.inventory_id &&
            (item.item_type === 'inventory' || item.item_type === 'sports_equipment')
          ) {
            await env.campusflow_db
              .prepare(`
                UPDATE inventory
                SET quantity_available = quantity_available - ?
                WHERE id = ? AND quantity_available >= ?
              `)
              .bind(item.quantity, item.inventory_id, item.quantity)
              .run();
          }
        }

        return json(
          { success: true, request_id: requestId, status },
          cors,
          201,
        );
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
            LEFT JOIN facilities f ON f.id = r.facility_id
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
      // POST /api/requests/:id/decide
      // ═══════════════════════════════════════════════════════════
      const decideMatch = path.match(/^\/api\/requests\/(\d+)\/decide$/);
      if (decideMatch && request.method === 'POST') {
        const reqId = Number(decideMatch[1]);
        const body = await request.json<{
          approver_id: number;
          decision: 'approved' | 'rejected' | 'needs_info';
          comments?: string;
        }>();

        if (!body.approver_id || !body.decision) {
          return json(
            { error: 'approver_id and decision are required' },
            cors,
            400,
          );
        }

        const req = await env.campusflow_db
          .prepare('SELECT id, status FROM requests WHERE id = ?')
          .bind(reqId)
          .first<{ id: number; status: string }>();

        if (!req) {
          return json({ error: 'Request not found' }, cors, 404);
        }

        const approver = await env.campusflow_db
          .prepare('SELECT id, role FROM users WHERE id = ?')
          .bind(body.approver_id)
          .first<{ id: number; role: string }>();

        if (!approver) {
          return json({ error: 'Approver not found' }, cors, 404);
        }

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            INSERT INTO approvals
              (request_id, approver_id, approver_role, decision, comments, decided_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(
            reqId,
            body.approver_id,
            approver.role,
            body.decision,
            body.comments ?? null,
            now,
          )
          .run();

        let newStatus = req.status;

        if (body.decision === 'rejected') {
          newStatus = 'rejected';
        } else if (body.decision === 'approved') {
          if (req.status === 'submitted') {
            newStatus = 'pending_approval';
          } else if (req.status === 'pending_approval') {
            newStatus = 'approved';
          }
        }

        await env.campusflow_db
          .prepare('UPDATE requests SET status = ?, approved_at = ? WHERE id = ?')
          .bind(newStatus, newStatus === 'approved' ? now : null, reqId)
          .run();

        return json({ success: true, status: newStatus }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // POST /api/requests/:id/cancel
      // ═══════════════════════════════════════════════════════════
      const cancelMatch = path.match(/^\/api\/requests\/(\d+)\/cancel$/);
      if (cancelMatch && request.method === 'POST') {
        const reqId = Number(cancelMatch[1]);
        const body = await request.json<{ user_id: number; reason?: string }>();

        if (!body.user_id) {
          return json({ error: 'user_id is required' }, cors, 400);
        }

        const req = await env.campusflow_db
          .prepare('SELECT id, requester_id, status FROM requests WHERE id = ?')
          .bind(reqId)
          .first<{ id: number; requester_id: number; status: string }>();

        if (!req) {
          return json({ error: 'Request not found' }, cors, 404);
        }
        if (req.requester_id !== body.user_id) {
          return json({ error: 'Not your request' }, cors, 403);
        }
        if (['completed', 'cancelled', 'rejected'].includes(req.status)) {
          return json(
            { error: `Cannot cancel a ${req.status} request` },
            cors,
            400,
          );
        }

        // Restore inventory stock for any borrowed items
        const borrowItems = await env.campusflow_db
          .prepare(`
            SELECT inventory_id, quantity
            FROM request_items
            WHERE request_id = ?
              AND inventory_id IS NOT NULL
              AND item_type IN ('inventory', 'sports_equipment')
          `)
          .bind(reqId)
          .all<{ inventory_id: number; quantity: number }>();

        for (const item of borrowItems.results ?? []) {
          await env.campusflow_db
            .prepare(`
              UPDATE inventory
              SET quantity_available = quantity_available + ?
              WHERE id = ?
            `)
            .bind(item.quantity, item.inventory_id)
            .run();
        }

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            UPDATE requests
            SET status = 'cancelled', cancelled_at = ?, cancellation_reason = ?
            WHERE id = ?
          `)
          .bind(now, body.reason ?? null, reqId)
          .run();

        return json({ success: true, status: 'cancelled' }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // GET /api/admin/queue?approver_id=X
      //   Faculty:    requests they sponsor, status='submitted'
      //   Technician: requests pending approval from facilities
      //               in their department's category scope
      //   Admin:      all non-terminal requests
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/admin/queue' && request.method === 'GET') {
        const approverId = url.searchParams.get('approver_id');
        if (!approverId) {
          return json({ error: 'approver_id is required' }, cors, 400);
        }

        const approver = await env.campusflow_db
          .prepare('SELECT id, role, department FROM users WHERE id = ?')
          .bind(Number(approverId))
          .first<{ id: number; role: string; department: string | null }>();

        if (!approver) {
          return json({ error: 'Approver not found' }, cors, 404);
        }

        let sql = `
          SELECT
            r.id, r.kind, r.title, r.status, r.purpose, r.return_by,
            r.created_at, r.submitted_at,
            f.id AS facility_id, f.code AS facility_code, f.name AS facility_name,
            f.category AS facility_category,
            u.name AS requester_name, u.email AS requester_email,
            s.name AS sponsor_name
          FROM requests r
          LEFT JOIN facilities f ON f.id = r.facility_id
          JOIN users u ON u.id = r.requester_id
          LEFT JOIN users s ON s.id = r.sponsor_id
          WHERE 1=1
        `;
        const params: unknown[] = [];

        if (approver.role === 'faculty') {
          // Only requests where this faculty is the named sponsor
          sql += ' AND r.sponsor_id = ? AND r.status = "submitted"';
          params.push(Number(approverId));
        } else if (approver.role === 'technician') {
          // Only pending-approval requests from facilities in this technician's
          // department scope. Department string → facility categories.
          const DEPT_CATEGORIES: Record<string, string[]> = {
            'ECE Labs':     ['electronics'],
            'MECH Labs':    ['mechanical'],
            'CSE Labs':     ['computing_ai'],
            'EEE Labs':     ['energy'],
            'Chemical Labs':['chemical'],
            'Innovation':   ['innovation'],
          };

          const categories = DEPT_CATEGORIES[approver.department ?? ''] ?? [];

          sql += ' AND r.status = "pending_approval"';

          if (categories.length > 0) {
            const placeholders = categories.map(() => '?').join(',');
            sql += ` AND f.category IN (${placeholders})`;
            params.push(...categories);
          }
          // If no scope mapping, fall back to showing all pending (admin-like)
        } else if (approver.role === 'admin') {
          sql += ' AND r.status NOT IN ("completed","rejected","cancelled")';
        } else {
          return json({ queue: [] }, cors);
        }

        sql += ' ORDER BY r.submitted_at ASC';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ queue: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // GET /api/users?role=X
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/users' && request.method === 'GET') {
        const role = url.searchParams.get('role');

        let sql = `
          SELECT id, email, name, role, department
          FROM users
        `;
        const params: unknown[] = [];

        if (role) {
          sql += ' WHERE role = ?';
          params.push(role);
        }
        sql += ' ORDER BY role, department, name';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ users: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // POST /api/auth/login
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json<{ email: string; password: string }>();
        const email = (body.email ?? '').trim().toLowerCase();
        const password = body.password ?? '';

        if (!email || !password) {
          return json({ error: 'Email and password are required' }, cors, 400);
        }

        const user = await env.campusflow_db
          .prepare(`
            SELECT id, email, name, role, department, sponsor_id, password
            FROM users
            WHERE LOWER(email) = ?
          `)
          .bind(email)
          .first<any>();

        if (!user || user.password !== password) {
          return json({ error: 'Invalid email or password' }, cors, 401);
        }

        const initials = user.name
          .split(/[\s-]+/)
          .map((p: string) => p[0])
          .filter(Boolean)
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return json(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              department: user.department,
              sponsor_id: user.sponsor_id,
              initials,
            },
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
          items: Array<{
            menu_item_id: number;
            name: string;
            price_cents: number;
            prep_time_minutes: number;
            quantity: number;
            notes?: string;
          }>;
        }>();

        if (!body.user_id || !body.facility_id || !body.pickup_at || !body.items?.length) {
          return json({ error: 'Missing required fields' }, cors, 400);
        }

        const subtotal = body.items.reduce(
          (sum, line) => sum + (line.price_cents ?? 0) * line.quantity,
          0,
        );
        const gst = Math.round(subtotal * 0.05);
        const total = subtotal + gst;

        const prepMax = Math.max(
          ...body.items.map((line) => line.prep_time_minutes ?? 10),
          10,
        );

        const title =
          body.items.length === 1
            ? `Order — ${body.items[0].quantity}× ${body.items[0].name}`
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
              VALUES (?, 'menu_item', NULL, ?, 'plate', ?)
            `)
            .bind(
              requestId,
              line.quantity,
              `${line.name} · ₹${((line.price_cents ?? 0) / 100).toFixed(0)}`,
            )
            .run();
        }

        const maxQueue = await env.campusflow_db
          .prepare('SELECT COALESCE(MAX(queue_position), 0) AS max_q FROM canteen_orders')
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
      // LIBRARY — GET /api/library/books
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/books' && request.method === 'GET') {
        const query = url.searchParams.get('q');
        const filter = url.searchParams.get('filter');

        let sql = `
          SELECT id, isbn, title, author, total_copies, available_copies, shelf_code
          FROM library_books
          WHERE 1=1
        `;
        const params: unknown[] = [];

        if (query) {
          sql += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
          const like = `%${query}%`;
          params.push(like, like, like);
        }
        if (filter === 'available') {
          sql += ' AND available_copies > 0';
        } else if (filter === 'out') {
          sql += ' AND available_copies = 0';
        }
        sql += ' ORDER BY title';

        const result = await env.campusflow_db
          .prepare(sql)
          .bind(...params)
          .all();

        return json({ books: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // LIBRARY — GET /api/library/loans?user_id=X
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/loans' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        if (!userId) {
          return json({ error: 'user_id is required' }, cors, 400);
        }

        const result = await env.campusflow_db
          .prepare(`
            SELECT
              l.id AS loan_id,
              l.borrowed_at,
              l.due_date,
              l.renewals,
              b.id AS book_id,
              b.isbn,
              b.title,
              b.author,
              b.shelf_code
            FROM library_loans l
            JOIN library_books b ON b.id = l.book_id
            WHERE l.user_id = ? AND l.returned_at IS NULL
            ORDER BY l.due_date ASC
          `)
          .bind(Number(userId))
          .all();

        return json({ loans: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // POST /api/library/renew
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/renew' && request.method === 'POST') {
        const body = await request.json<{ user_id: number; loan_id: number }>();

        if (!body.user_id || !body.loan_id) {
          return json({ error: 'user_id and loan_id are required' }, cors, 400);
        }

        const loan = await env.campusflow_db
          .prepare(`
            SELECT l.id, l.user_id, l.book_id, l.due_date, l.returned_at,
                   b.title
            FROM library_loans l
            JOIN library_books b ON b.id = l.book_id
            WHERE l.id = ?
          `)
          .bind(body.loan_id)
          .first<any>();

        if (!loan) {
          return json({ error: 'Loan not found' }, cors, 404);
        }
        if (loan.user_id !== body.user_id) {
          return json({ error: 'Not your loan' }, cors, 403);
        }
        if (loan.returned_at) {
          return json({ error: 'Already returned' }, cors, 400);
        }

        const newDue = new Date();
        newDue.setDate(newDue.getDate() + 14);
        const newDueStr = newDue.toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            UPDATE library_loans
            SET due_date = ?, renewals = renewals + 1
            WHERE id = ?
          `)
          .bind(newDueStr, body.loan_id)
          .run();

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            INSERT INTO requests
              (kind, requester_id, title, description, status,
               scheduled_start, created_at, submitted_at, approved_at)
            VALUES
              ('library', ?, ?, 'Renewed for 14 days', 'completed',
               ?, ?, ?, ?)
          `)
          .bind(
            body.user_id,
            `Renewal — ${loan.title}`,
            newDueStr,
            now,
            now,
            now,
          )
          .run();

        return json(
          {
            success: true,
            loan_id: body.loan_id,
            due_date: newDueStr,
            days: 14,
          },
          cors,
        );
      }

      // ═══════════════════════════════════════════════════════════
      // STORE — GET /api/store/items
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/store/items' && request.method === 'GET') {
        const result = await env.campusflow_db
          .prepare(`
            SELECT id, name, description, category, price_cents, unit, available
            FROM store_items
            WHERE available > 0
            ORDER BY category, display_order, name
          `)
          .all();

        return json({ items: result.results }, cors);
      }

      // ═══════════════════════════════════════════════════════════
      // AI ASSISTANT — POST /api/ai/chat
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/ai/chat' && request.method === 'POST') {
        const body = await request.json<{ message: string }>();
        const message = (body.message ?? '').trim();

        if (!message) {
          return json({ error: 'Empty message' }, cors, 400);
        }
        if (message.length > 2000) {
          return json({ error: 'Message too long' }, cors, 400);
        }

        const facilities = await env.campusflow_db
          .prepare(`
            SELECT code, name, category, description, equipment
            FROM facilities
            WHERE kind = 'lab'
            ORDER BY category, code
          `)
          .all();

        const facilityList = (facilities.results ?? [])
          .map((f: any) => {
            const eq = safeParse(f.equipment) as string[];
            const equipmentStr =
              eq.length > 0 ? `Equipment: ${eq.join(', ')}` : 'Equipment: (not listed)';
            return `[${f.code}] ${f.name} (${f.category})\n${f.description}\n${equipmentStr}`;
          })
          .join('\n\n');

        const systemPrompt = `You are CampusFlow Assistant for Amrita Vishwa Vidyapeetham, Ettimadai campus.

You help students, faculty, and staff find labs, equipment, and services.

You ONLY know the facilities listed below. You do NOT invent labs, equipment, or contacts.

=== FACILITIES ===
${facilityList}
=== END FACILITIES ===

SERVICES AVAILABLE:
- Lab access — requires faculty sponsor, a stated purpose, and a list of items
- Canteen — pre-order meals, pickup slot
- Library — search and renew books
- Sports — borrow sports equipment
- Stores — reserve stationery, essentials

STRICT RULES:
1. Only reference facilities by their code (E-08, C-02, etc.) when you name them.
2. If a question asks about equipment, check the "Equipment:" line for each lab. If no lab lists that equipment, say "No lab currently lists that equipment."
3. If you are unsure, ask a clarifying question instead of guessing.
4. Never invent facility names, codes, contacts, or equipment.
5. Keep answers under 4 sentences unless the user asks for a full list.
6. Reply in plain English. No markdown headers or bullet lists unless the user asks.

EXAMPLES:

User: Which lab has an FPGA board available?
Assistant: Three labs list FPGA hardware. VLSI Design – UG (E-08) has Basys 3 and Zybo Z7-10 boards. DSP Lab (E-07) has ATLYS and ANVYL Spartan-6 boards. VLSI Design – PG (E-10) has the Xilinx ZCU104 evaluation kit. You'll need a faculty sponsor and an induction certificate to request access.

User: Where can I do nanomaterial synthesis?
Assistant: Nanomaterials Laboratory (CH-04) supports nanomaterial synthesis, thin-film deposition, and electrical property measurements. You'll need a faculty sponsor and a stated purpose. Would you like me to point you to the request form?

User: Can I book a tennis court?
Assistant: I don't have a tennis court in the current list. The Sports page has sports equipment for borrowing. Check there, or let me know what you need and I'll look again.

User: I need something for my IoT project.
Assistant: Intelligent Electronics System Laboratory (C-02) has ESP32 boards, LoRa gateways, and NVIDIA Jetson Nano kits — a strong fit for IoT work. Would you like me to check what else is available?`;

        const aiResponse = await env.AI.run(
          '@cf/meta/llama-3.1-8b-instruct-fp8-fast',
          {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            max_tokens: 400,
            temperature: 0.1,
          },
        );

        const reply =
          typeof aiResponse === 'string'
            ? aiResponse
            : (aiResponse as any)?.response ?? 'I could not generate a response.';

        return json({ reply }, cors);
      }

            // ═══════════════════════════════════════════════════════════
      // GET /api/canteen/queue
      //   Full pending order list with items for the kitchen view
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/canteen/queue' && request.method === 'GET') {
        const orders = await env.campusflow_db
          .prepare(`
            SELECT
              co.request_id, co.queue_position, co.pickup_at,
              co.paid_at, co.prep_started_at, co.prep_completed_at,
              r.title, r.status,
              u.name AS requester_name, u.email AS requester_email
            FROM canteen_orders co
            JOIN requests r ON r.id = co.request_id
            JOIN users u ON u.id = r.requester_id
            WHERE co.prep_completed_at IS NULL
            ORDER BY co.queue_position ASC
            LIMIT 50
          `)
          .all();

        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          (orders.results ?? []).map(async (o: any) => {
            const items = await env.campusflow_db
              .prepare(`
                SELECT quantity, notes
                FROM request_items
                WHERE request_id = ?
              `)
              .bind(o.request_id)
              .all();
            return { ...o, items: items.results ?? [] };
          }),
        );

        return json({ queue: ordersWithItems }, cors);
      }

            // ═══════════════════════════════════════════════════════════
      // POST /api/canteen/order/:id/ready
      // ═══════════════════════════════════════════════════════════
      const canteenReadyMatch = path.match(/^\/api\/canteen\/order\/(\d+)\/ready$/);
      if (canteenReadyMatch && request.method === 'POST') {
        const requestId = Number(canteenReadyMatch[1]);
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        await env.campusflow_db
          .prepare(`
            UPDATE canteen_orders
            SET prep_completed_at = ?, ready_notified_at = ?
            WHERE request_id = ?
          `)
          .bind(now, now, requestId)
          .run();

        await env.campusflow_db
          .prepare(`UPDATE requests SET status = 'completed', completed_at = ? WHERE id = ?`)
          .bind(now, requestId)
          .run();

        return json({ success: true }, cors);
      }

            // ═══════════════════════════════════════════════════════════
      // GET /api/library/pending-renewals
      //   Recent renewals for the library staff view
      // ═══════════════════════════════════════════════════════════
      if (path === '/api/library/pending-renewals' && request.method === 'GET') {
        const result = await env.campusflow_db
          .prepare(`
            SELECT
              r.id AS request_id,
              r.title,
              r.status,
              r.created_at,
              u.name AS requester_name,
              u.email AS requester_email
            FROM requests r
            JOIN users u ON u.id = r.requester_id
            WHERE r.kind = 'library'
            ORDER BY r.created_at DESC
            LIMIT 50
          `)
          .all();

        return json({ renewals: result.results }, cors);
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