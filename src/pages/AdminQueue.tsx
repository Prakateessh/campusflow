import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

type Decision = 'approved' | 'rejected' | 'needs_info';

interface QueueItem {
  id: string;
  kind: 'Lab' | 'Canteen' | 'Sports' | 'Store' | 'Library';
  title: string;
  requester: { name: string; dept: string; year: string };
  sponsor: { name: string } | null;
  facility: { code: string; name: string };
  submittedAt: string;
  waitingFor: string;   // 'You' if it's my queue, else name
  items: Array<{ qty: number; name: string }>;
  notes?: string;
  priority: 'high' | 'normal';
}

const QUEUE: QueueItem[] = [
  {
    id: 'R-1043',
    kind: 'Lab',
    title: 'SEM imaging — 3 PCB samples',
    requester: { name: 'Divya Menon', dept: 'ECE', year: 'Semester 5' },
    sponsor: { name: 'Dr. Priya Nair' },
    facility: { code: 'CH-01', name: 'Central Instrumentation Facility' },
    submittedAt: '13 Oct · 10:04',
    waitingFor: 'You',
    items: [
      { qty: 3, name: 'SEM imaging runs' },
      { qty: 1, name: 'Technician assistance' },
    ],
    notes: 'Sample preparation is complete. FESEM required, 10 min per sample.',
    priority: 'normal',
  },
  {
    id: 'R-1045',
    kind: 'Lab',
    title: 'VLSI FPGA board — Basys 3 (1 week)',
    requester: { name: 'Karthik R.', dept: 'ECE', year: 'Semester 6' },
    sponsor: { name: 'Dr. Ramesh Kumar' },
    facility: { code: 'E-08', name: 'VLSI Design – UG Laboratory' },
    submittedAt: '13 Oct · 09:12',
    waitingFor: 'You',
    items: [{ qty: 1, name: 'Basys 3 FPGA Board' }],
    notes: 'Digital design assignment submission on 22 Oct.',
    priority: 'high',
  },
  {
    id: 'R-1046',
    kind: 'Lab',
    title: 'Welding slot — 2 hours (drone frame)',
    requester: { name: 'Rahul Sharma', dept: 'MECH', year: 'Semester 7' },
    sponsor: { name: 'Dr. Arun A.' },
    facility: { code: 'M-05', name: 'Welding Lab' },
    submittedAt: '13 Oct · 08:45',
    waitingFor: 'Dr. A. Sumesh',
    items: [{ qty: 1, name: 'Supervised welding session' }],
    notes: 'GTAW on aluminium. Student has completed induction.',
    priority: 'normal',
  },
  {
    id: 'R-1047',
    kind: 'Lab',
    title: '3D print — robot chassis (PLA)',
    requester: { name: 'Aarav P.', dept: 'CSE', year: 'Semester 3' },
    sponsor: { name: 'Dr. Priya Nair' },
    facility: { code: 'I-01', name: 'Additive Manufacturing Lab' },
    submittedAt: '12 Oct · 16:30',
    waitingFor: 'You',
    items: [
      { qty: 1, name: '3D print job · PLA' },
      { qty: 1, name: 'PLA filament · 200g' },
    ],
    notes: 'Estimate 6 hours print time.',
    priority: 'normal',
  },
  {
    id: 'R-1048',
    kind: 'Sports',
    title: 'Badminton gear — 2 rackets + shuttle tube',
    requester: { name: 'Meera N.', dept: 'CSE', year: 'Semester 4' },
    sponsor: null,
    facility: { code: 'G-07', name: 'Sports Materials' },
    submittedAt: '12 Oct · 14:10',
    waitingFor: 'Sports counter',
    items: [
      { qty: 2, name: 'Badminton Racket' },
      { qty: 1, name: 'Shuttlecock tube of 6' },
    ],
    priority: 'normal',
  },
];

const kindLabels: Record<QueueItem['kind'], string> = {
  Lab: 'Lab',
  Canteen: 'Canteen',
  Sports: 'Sports',
  Store: 'Store',
  Library: 'Library',
};

export default function AdminQueue() {
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [note, setNote] = useState('');

  const visible = useMemo(
    () => (filter === 'mine' ? QUEUE.filter((q) => q.waitingFor === 'You') : QUEUE),
    [filter],
  );

  const openItem = visible.find((q) => q.id === active);

  const submitDecision = (id: string, decision: Decision) => {
    setDecisions((d) => ({ ...d, [id]: decision }));
    setActive(null);
    setNote('');
  };

  const counts = {
    all: QUEUE.length,
    mine: QUEUE.filter((q) => q.waitingFor === 'You').length,
    high: QUEUE.filter((q) => q.priority === 'high').length,
  };

  return (
    <Layout>
      {/* HEADING */}
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Approval queue</h1>
          </div>
          <span className="label num">
            {String(counts.mine).padStart(2, '0')} waiting on you
          </span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('mine')}
            className={`tag cursor-pointer transition-colors ${
              filter === 'mine' ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
            }`}
          >
            My queue
            <span className="ml-2 opacity-60 num">{String(counts.mine).padStart(2, '0')}</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`tag cursor-pointer transition-colors ${
              filter === 'all' ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
            }`}
          >
            All pending
            <span className="ml-2 opacity-60 num">{String(counts.all).padStart(2, '0')}</span>
          </button>
        </div>
      </section>

      {/* QUEUE */}
      <section className="pb-24">
        {visible.length === 0 ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Queue is clear</span>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
            {visible.map((q) => {
              const decided = decisions[q.id];
              return (
                <div
                  key={q.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${
                    decided ? 'opacity-50' : 'hover:bg-[var(--color-surface-low)]'
                  }`}
                >
                  {/* Left — id + kind + priority */}
                  <div className="col-span-12 md:col-span-2 flex flex-col gap-1">
                    <span className="label num">{q.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="label">{kindLabels[q.kind]}</span>
                      {q.priority === 'high' && !decided && (
                        <span className="label label-accent">Urgent</span>
                      )}
                    </div>
                  </div>

                  {/* Title + requester */}
                  <div className="col-span-12 md:col-span-5">
                    <p className="text-[16px]">{q.title}</p>
                    <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                      {q.requester.name} · {q.requester.dept} · {q.requester.year}
                      {q.sponsor && <> · sponsored by {q.sponsor.name}</>}
                    </p>
                  </div>

                  {/* Facility + waiting */}
                  <div className="col-span-6 md:col-span-3">
                    <p className="text-[14px] text-[var(--color-ink-2)]">
                      {q.facility.name}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--color-ink-4)] num">
                      {q.facility.code} · {q.submittedAt}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-6 md:col-span-2 md:text-right">
                    {decided ? (
                      <span
                        className={`label ${
                          decided === 'approved' ? 'label-ink'
                          : decided === 'rejected' ? 'label'
                          : 'label label-accent'
                        }`}
                      >
                        {decided === 'approved' ? 'Approved'
                          : decided === 'rejected' ? 'Rejected'
                          : 'Info requested'}
                      </span>
                    ) : q.waitingFor === 'You' ? (
                      <button
                        onClick={() => setActive(q.id)}
                        className="btn btn-ghost text-sm"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="label">Waiting on {q.waitingFor}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* REVIEW MODAL */}
      {openItem && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-[var(--color-card)] border border-[var(--color-rule)] w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <div className="flex items-center gap-3">
                <span className="label label-accent num">{openItem.id}</span>
                <span className="label">Review</span>
              </div>
              <button
                onClick={() => setActive(null)}
                className="label hover:text-[var(--color-ink)] transition"
              >
                Close
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6 space-y-8">
              <div>
                <h2 className="text-2xl leading-tight">{openItem.title}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-ink-3)]">
                  {openItem.requester.name} · {openItem.requester.dept} · {openItem.requester.year}
                </p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-6 border-t border-b border-[var(--color-rule)] py-5">
                <div>
                  <span className="label">Facility</span>
                  <p className="mt-2 text-[15px]">{openItem.facility.name}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--color-ink-3)] num">
                    {openItem.facility.code}
                  </p>
                </div>
                <div>
                  <span className="label">Submitted</span>
                  <p className="mt-2 text-[15px] num">{openItem.submittedAt}</p>
                </div>
                {openItem.sponsor && (
                  <div>
                    <span className="label">Sponsor</span>
                    <p className="mt-2 text-[15px]">{openItem.sponsor.name}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <span className="label">Items requested</span>
                <ul className="mt-3 border border-[var(--color-rule)] divide-y divide-[var(--color-rule)]">
                  {openItem.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-4 px-4 py-3">
                      <span className="label num w-8 shrink-0">
                        {String(it.qty).padStart(2, '0')}×
                      </span>
                      <span className="text-[15px]">{it.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notes */}
              {openItem.notes && (
                <div>
                  <span className="label">Student note</span>
                  <p className="mt-2 text-[15px] text-[var(--color-ink-2)] leading-relaxed italic">
                    “{openItem.notes}”
                  </p>
                </div>
              )}

              {/* Decision note */}
              <div>
                <label className="label block mb-2">Your note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the student…"
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-5 border-t border-[var(--color-rule)] bg-[var(--color-surface-low) grid grid-cols-3 gap-3">
              <button
                onClick={() => submitDecision(openItem.id, 'rejected')}
                className="btn btn-outline text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => submitDecision(openItem.id, 'needs_info')}
                className="btn btn-ghost text-sm"
              >
                Request info
              </button>
              <button
                onClick={() => submitDecision(openItem.id, 'approved')}
                className="btn btn-accent text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}