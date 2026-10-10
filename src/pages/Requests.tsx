import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

type Status = 'pending' | 'approved' | 'ready' | 'completed' | 'rejected';

interface RequestRow {
  id: string;
  title: string;
  facility: string;
  category: string;
  status: Status;
  when: string;
  submitted: string;
}

const REQUESTS: RequestRow[] = [
  {
    id: 'R-1042', title: 'Raspberry Pi + bench slot', facility: 'Embedded Computing Laboratory',
    category: 'Electronics', status: 'approved', when: 'Yesterday', submitted: '12 Oct 2026',
  },
  {
    id: 'R-1043', title: 'SEM imaging — 3 PCB samples', facility: 'Central Instrumentation Facility',
    category: 'Chemical', status: 'pending', when: '6h ago', submitted: '13 Oct 2026',
  },
  {
    id: 'R-1044', title: 'Lunch — 2× Masala Dosa', facility: 'Canteens',
    category: 'General', status: 'ready', when: 'in 3h', submitted: '13 Oct 2026',
  },
  {
    id: 'R-1039', title: 'VLSI FPGA board — 1 week loan', facility: 'VLSI Design – UG Laboratory',
    category: 'Electronics', status: 'completed', when: '3 days ago', submitted: '08 Oct 2026',
  },
  {
    id: 'R-1038', title: 'Cybersecurity capture-the-flag setup', facility: 'Cyber Security Lab',
    category: 'Computing & AI', status: 'completed', when: '5 days ago', submitted: '06 Oct 2026',
  },
  {
    id: 'R-1037', title: 'Welding — drone frame bracket', facility: 'Welding Lab',
    category: 'Mechanical', status: 'rejected', when: '1 week ago', submitted: '04 Oct 2026',
  },
  {
    id: 'R-1035', title: '3D print — robot chassis', facility: 'Additive Manufacturing Lab',
    category: 'Innovation', status: 'completed', when: '2 weeks ago', submitted: '28 Sep 2026',
  },
];

const STATUS_LABEL: Record<Status, string> = {
  pending:   'Pending',
  approved:  'Approved',
  ready:     'Ready',
  completed: 'Completed',
  rejected:  'Rejected',
};

export default function Requests() {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? REQUESTS : REQUESTS.filter((r) => r.status === filter)),
    [filter],
  );

  const counts = useMemo(() => ({
    all:       REQUESTS.length,
    pending:   REQUESTS.filter((r) => r.status === 'pending').length,
    approved:  REQUESTS.filter((r) => r.status === 'approved').length,
    ready:     REQUESTS.filter((r) => r.status === 'ready').length,
    completed: REQUESTS.filter((r) => r.status === 'completed').length,
    rejected:  REQUESTS.filter((r) => r.status === 'rejected').length,
  }), []);

  const statusStyle = (s: Status) => {
    if (s === 'ready')     return 'label label-accent';
    if (s === 'pending')   return 'label label-ink';
    if (s === 'rejected')  return 'label';
    return 'label';
  };

  const filters: Array<{ id: Status | 'all'; label: string; count: number }> = [
    { id: 'all',       label: 'All',       count: counts.all },
    { id: 'pending',   label: 'Pending',   count: counts.pending },
    { id: 'approved',  label: 'Approved',  count: counts.approved },
    { id: 'ready',     label: 'Ready',     count: counts.ready },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'rejected',  label: 'Rejected',  count: counts.rejected },
  ];

  return (
    <Layout>
      {/* HEADING */}
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">My requests</h1>
          </div>
          <span className="label num">
            {String(filtered.length).padStart(2, '0')} / {REQUESTS.length}
          </span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`tag cursor-pointer transition-colors ${
                filter === f.id ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
              }`}
            >
              {f.label}
              <span className="ml-2 opacity-60 num">{String(f.count).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* LIST */}
      <section className="pb-24">
        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
            <span className="col-span-2 label">ID</span>
            <span className="col-span-5 label">Request</span>
            <span className="col-span-3 label">Facility</span>
            <span className="col-span-2 label text-right">Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--color-rule)]">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to={`/requests/${r.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
              >
                <div className="md:col-span-2 flex flex-col gap-1">
                  <span className="label num">{r.id}</span>
                  <span className="text-[12px] text-[var(--color-ink-4)] num">{r.submitted}</span>
                </div>
                <span className="md:col-span-5 text-[16px]">{r.title}</span>
                <span className="md:col-span-3 text-[15px] text-[var(--color-ink-3)]">
                  {r.facility}
                </span>
                <span className={`md:col-span-2 md:text-right ${statusStyle(r.status)}`}>
                  {STATUS_LABEL[r.status]} · {r.when}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <span className="label">No requests match this filter</span>
          </div>
        )}
      </section>
    </Layout>
  );
}