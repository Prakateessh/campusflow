import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';

type Status = 'pending' | 'approved' | 'ready' | 'completed' | 'rejected' | 'cancelled' | 'scheduled';

interface TimelineStep {
  label: string;
  actor: string;
  note?: string;
  at?: string;
  state: 'done' | 'active' | 'pending';
}

interface LineItem {
  qty: number;
  name: string;
  meta?: string;
}

interface RequestDetailData {
  id: string;
  title: string;
  facility: { id: number; name: string; code: string; category: string };
  status: Status;
  submittedAt: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  sponsor?: { name: string; dept: string; email: string };
  description: string;
  items: LineItem[];
  timeline: TimelineStep[];
}

const REQUESTS: Record<string, RequestDetailData> = {
  'R-1042': {
    id: 'R-1042',
    title: 'Raspberry Pi + bench slot',
    facility: { id: 20, name: 'Embedded Computing Laboratory', code: 'E-09', category: 'Electronics' },
    status: 'approved',
    submittedAt: '12 Oct 2026 · 14:12',
    scheduledStart: '14 Oct 2026 · 15:00',
    scheduledEnd: '14 Oct 2026 · 17:00',
    sponsor: { name: 'Dr. Priya Nair', dept: 'CSE', email: 'priya@amrita.edu' },
    description:
      'Requesting one Raspberry Pi 4 (4 GB) for 7 days plus a 2-hour bench slot to prototype a smart irrigation sensor loop.',
    items: [
      { qty: 1, name: 'Raspberry Pi 4 (4 GB)', meta: 'Component loan · return by 21 Oct' },
      { qty: 1, name: 'Bench 04 slot', meta: '14 Oct · 15:00 – 17:00 · supervised' },
      { qty: 1, name: 'DHT22 Temp/Humidity Sensor', meta: 'Component loan · return by 21 Oct' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '12 Oct · 14:12', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Priya Nair',   at: '12 Oct · 14:45', note: 'Fine, but return the Pi by end of week.', state: 'done' },
      { label: 'Technician approved', actor: 'Suresh M.',        at: '12 Oct · 16:20', note: 'Bench 4 reserved. Bring your own SD card.', state: 'done' },
      { label: 'Scheduled',           actor: 'System',           at: '14 Oct · 15:00', state: 'active' },
      { label: 'Completed',           actor: 'System',           at: '—',              state: 'pending' },
    ],
  },

  'R-1043': {
    id: 'R-1043',
    title: 'SEM imaging — 3 PCB samples',
    facility: { id: 22, name: 'Central Instrumentation Facility', code: 'CH-01', category: 'Chemical' },
    status: 'pending',
    submittedAt: '13 Oct 2026 · 10:04',
    scheduledStart: '15 Oct 2026 · 10:00',
    scheduledEnd: '15 Oct 2026 · 11:00',
    sponsor: { name: 'Dr. Priya Nair', dept: 'CSE', email: 'priya@amrita.edu' },
    description:
      'Requesting SEM imaging of three PCB cross-sections to inspect solder joints. Sample preparation is complete.',
    items: [
      { qty: 3, name: 'SEM imaging runs', meta: 'FESEM · 10 min per sample' },
      { qty: 1, name: 'Technician assistance', meta: 'Required for SEM operation' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '13 Oct · 10:04', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Priya Nair',   at: '13 Oct · 10:30', state: 'done' },
      { label: 'Technician review',   actor: 'Central Instrumentation Facility', at: '—', state: 'active' },
      { label: 'Scheduled',           actor: 'System',           at: '—', state: 'pending' },
      { label: 'Completed',           actor: 'System',           at: '—', state: 'pending' },
    ],
  },

  'R-1044': {
    id: 'R-1044',
    title: 'Lunch — 2× Masala Dosa',
    facility: { id: 40, name: 'Canteens', code: 'G-06', category: 'General' },
    status: 'ready',
    submittedAt: '13 Oct 2026 · 12:14',
    scheduledStart: '13 Oct 2026 · 13:00',
    description: 'Pre-order for pickup at the Main Canteen counter.',
    items: [
      { qty: 2, name: 'Masala Dosa', meta: 'Extra chutney on one' },
    ],
    timeline: [
      { label: 'Submitted',        actor: 'You',      at: '13 Oct · 12:14', state: 'done' },
      { label: 'Canteen accepted', actor: 'Kumar S.', at: '13 Oct · 12:15', state: 'done' },
      { label: 'Paid via UPI',     actor: 'You',      at: '13 Oct · 12:20', state: 'done' },
      { label: 'Ready',            actor: 'Kitchen',  at: '13 Oct · 12:50', state: 'active' },
      { label: 'Picked up',        actor: 'You',      at: '—',              state: 'pending' },
    ],
  },

  'R-1039': {
    id: 'R-1039',
    title: 'VLSI FPGA board — 1 week loan',
    facility: { id: 18, name: 'VLSI Design – UG Laboratory', code: 'E-08', category: 'Electronics' },
    status: 'completed',
    submittedAt: '08 Oct 2026 · 09:22',
    scheduledStart: '09 Oct 2026 · 10:00',
    scheduledEnd: '16 Oct 2026 · 10:00',
    sponsor: { name: 'Dr. Ramesh Kumar', dept: 'ECE', email: 'ramesh@amrita.edu' },
    description: 'Basys 3 FPGA board for a week-long digital design assignment.',
    items: [
      { qty: 1, name: 'Basys 3 FPGA Board', meta: 'Returned 16 Oct' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '08 Oct · 09:22', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Ramesh Kumar', at: '08 Oct · 10:04', state: 'done' },
      { label: 'Technician approved', actor: 'Suresh M.',        at: '08 Oct · 11:30', state: 'done' },
      { label: 'Collected',           actor: 'You',              at: '09 Oct · 10:12', state: 'done' },
      { label: 'Returned',            actor: 'You',              at: '16 Oct · 09:40', state: 'done' },
    ],
  },

  'R-1038': {
    id: 'R-1038',
    title: 'Cybersecurity capture-the-flag setup',
    facility: { id: 46, name: 'Cyber Security Lab', code: 'C-08', category: 'Computing & AI' },
    status: 'completed',
    submittedAt: '06 Oct 2026 · 11:45',
    scheduledStart: '07 Oct 2026 · 14:00',
    scheduledEnd: '07 Oct 2026 · 17:00',
    sponsor: { name: 'Dr. Priya Nair', dept: 'CSE', email: 'priya@amrita.edu' },
    description: 'Requested use of the lab GPU cluster and secure routers for a CTF practice round.',
    items: [
      { qty: 1, name: 'Lab GPU cluster access', meta: '3 hours · 4 nodes' },
      { qty: 2, name: 'Secure router pair', meta: 'For network simulation' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '06 Oct · 11:45', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Priya Nair',   at: '06 Oct · 12:10', state: 'done' },
      { label: 'Technician approved', actor: 'Lab in-charge',    at: '06 Oct · 14:30', state: 'done' },
      { label: 'Session held',        actor: 'You',              at: '07 Oct · 17:00', state: 'done' },
      { label: 'Completed',           actor: 'System',           at: '07 Oct · 17:05', state: 'done' },
    ],
  },

  'R-1037': {
    id: 'R-1037',
    title: 'Welding — drone frame bracket',
    facility: { id: 45, name: 'Welding Lab', code: 'M-05', category: 'Mechanical' },
    status: 'rejected',
    submittedAt: '04 Oct 2026 · 16:40',
    sponsor: { name: 'Dr. Ramesh Kumar', dept: 'ECE', email: 'ramesh@amrita.edu' },
    description: 'Request for a 2-hour supervised welding session to fabricate an aluminium drone bracket.',
    items: [
      { qty: 1, name: 'Supervised welding session', meta: 'GTAW · aluminium' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '04 Oct · 16:40', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Ramesh Kumar', at: '04 Oct · 18:12', state: 'done' },
      { label: 'Technician review',   actor: 'Dr. A. Sumesh',    at: '05 Oct · 09:20', note: 'Aluminium GTAW requires prior induction. Please complete the safety induction and resubmit.', state: 'done' },
      { label: 'Rejected',            actor: 'System',           at: '05 Oct · 09:20', state: 'done' },
    ],
  },

  'R-1035': {
    id: 'R-1035',
    title: '3D print — robot chassis',
    facility: { id: 7, name: 'Additive Manufacturing Lab', code: 'I-01', category: 'Innovation' },
    status: 'completed',
    submittedAt: '28 Sep 2026 · 10:20',
    scheduledStart: '29 Sep 2026 · 09:00',
    scheduledEnd: '29 Sep 2026 · 15:00',
    sponsor: { name: 'Dr. Priya Nair', dept: 'CSE', email: 'priya@amrita.edu' },
    description: 'PLA print job for a robot chassis — 6-hour print with 200g filament.',
    items: [
      { qty: 1, name: '3D print job · PLA', meta: '6 hours · Lapwing FDM' },
      { qty: 1, name: 'PLA filament · 200g', meta: 'Material issued' },
    ],
    timeline: [
      { label: 'Submitted',           actor: 'You',              at: '28 Sep · 10:20', state: 'done' },
      { label: 'Sponsor approved',    actor: 'Dr. Priya Nair',   at: '28 Sep · 11:00', state: 'done' },
      { label: 'Print started',       actor: 'Technician',       at: '29 Sep · 09:15', state: 'done' },
      { label: 'Print completed',     actor: 'Technician',       at: '29 Sep · 15:30', state: 'done' },
      { label: 'Collected',           actor: 'You',              at: '29 Sep · 16:10', state: 'done' },
    ],
  },
};

const statusLabel: Record<Status, string> = {
  pending: 'Pending',
  approved: 'Approved',
  ready: 'Ready',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  scheduled: 'Scheduled',
};

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initial = id ? REQUESTS[id] : undefined;
  const [overrideStatus, setOverrideStatus] = useState<Status | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!initial) {
    return (
      <Layout>
        <section className="py-24 text-center">
          <span className="label label-accent">404</span>
          <h1 className="mt-4 text-3xl">Request not found</h1>
          <Link to="/requests" className="btn-link text-sm inline-block mt-6">
            ← Back to requests
          </Link>
        </section>
      </Layout>
    );
  }

  const req = overrideStatus ? { ...initial, status: overrideStatus } : initial;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleDownload = () => flash('Pass downloaded · check your email');
  const handleReminder = () => flash('Reminder sent to approver');
  const handleCancel = () => {
    setOverrideStatus('cancelled');
    flash('Request cancelled');
  };
  const handleResubmit = () => navigate('/facilities');

  const statusStyle =
    req.status === 'ready'     ? 'label label-accent'
    : req.status === 'pending' ? 'label label-ink'
    : req.status === 'cancelled' ? 'label'
    : 'label';

  // ── Actions available depending on state ──
  const actions: Array<{ label: string; kind: 'primary' | 'outline' | 'ghost'; onClick: () => void }> = [];
  if (req.status === 'approved' || req.status === 'scheduled') {
    actions.push({ label: 'Download pass', kind: 'primary', onClick: handleDownload });
    actions.push({ label: 'Cancel request', kind: 'outline', onClick: handleCancel });
  } else if (req.status === 'pending') {
    actions.push({ label: 'Send reminder', kind: 'primary', onClick: handleReminder });
    actions.push({ label: 'Cancel request', kind: 'outline', onClick: handleCancel });
  } else if (req.status === 'ready') {
    actions.push({ label: 'Open queue ticket', kind: 'primary', onClick: () => navigate('/canteen') });
  } else if (req.status === 'rejected') {
    actions.push({ label: 'Resubmit request', kind: 'primary', onClick: handleResubmit });
  }

  return (
    <Layout>
      {/* BREADCRUMB */}
      <section className="pt-10 pb-6">
        <Link to="/requests" className="label hover:text-[var(--color-ink)] transition">
          ← All requests
        </Link>
      </section>

      {/* HEADING */}
      <section className="pb-12">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="label label-accent num">{req.id}</span>
          <span className="w-6 h-px bg-[var(--color-rule)]" />
          <span className={statusStyle}>{statusLabel[req.status]}</span>
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-3xl">
          {req.title}
        </h1>
        <p className="mt-4 text-[15px] text-[var(--color-ink-3)]">
          {req.facility.name} · {req.facility.code}
        </p>
      </section>

      {/* MAIN */}
      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[var(--color-accent)]" />
                <h2 className="text-lg">Description</h2>
              </div>
              <p className="text-[16px] text-[var(--color-ink-2)] leading-relaxed">
                {req.description}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px bg-[var(--color-accent)]" />
                  <h2 className="text-lg">Items</h2>
                </div>
                <span className="label num">
                  {String(req.items.length).padStart(2, '0')} line{req.items.length > 1 ? 's' : ''}
                </span>
              </div>
              <ul className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                {req.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 px-5 py-4">
                    <span className="label num shrink-0 mt-0.5 w-8">
                      {String(item.qty).padStart(2, '0')}×
                    </span>
                    <div className="flex-1">
                      <p className="text-[15px]">{item.name}</p>
                      {item.meta && (
                        <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">{item.meta}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[var(--color-accent)]" />
                <h2 className="text-lg">Timeline</h2>
              </div>
              <ol className="space-y-6">
                {req.timeline.map((step, i) => (
                  <li key={i} className="grid grid-cols-12 gap-4">
                    <div className="col-span-1 flex justify-center pt-1.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 ${
                          step.state === 'done' ? 'bg-[var(--color-ink)]'
                          : step.state === 'active' ? 'bg-[var(--color-accent)]'
                          : 'bg-[var(--color-ink-4)]'
                        }`}
                      />
                    </div>
                    <div className="col-span-11">
                      <div className="flex items-baseline justify-between gap-4">
                        <span
                          className={`text-[15px] ${
                            step.state === 'pending'
                              ? 'text-[var(--color-ink-4)]'
                              : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="label num shrink-0">{step.at ?? '—'}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                        {step.actor}
                      </p>
                      {step.note && (
                        <p className="mt-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed italic">
                          “{step.note}”
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">

            {actions.length > 0 && (
              <div className="space-y-3">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className={`${
                      a.kind === 'primary' ? 'btn btn-accent'
                      : a.kind === 'outline' ? 'btn btn-outline'
                      : 'btn btn-ghost'
                    } w-full text-sm`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Details</span>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Submitted</dt>
                  <dd className="num text-right">{req.submittedAt}</dd>
                </div>
                {req.scheduledStart && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Scheduled</dt>
                    <dd className="num text-right">{req.scheduledStart}</dd>
                  </div>
                )}
                {req.scheduledEnd && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Until</dt>
                    <dd className="num text-right">{req.scheduledEnd}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Facility</dt>
                  <dd className="text-right">{req.facility.code}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Category</dt>
                  <dd className="text-right">{req.facility.category}</dd>
                </div>
              </dl>
            </div>

            {req.sponsor && (
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Sponsor</span>
                <p className="mt-4 text-[15px]">{req.sponsor.name}</p>
                <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                  {req.sponsor.dept}
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-ink-3)] num">
                  {req.sponsor.email}
                </p>
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Related</span>
              <Link
                to={`/facilities/${req.facility.id}`}
                className="mt-4 inline-flex items-center gap-2 text-[15px] hover:text-[var(--color-accent)] transition-colors"
              >
                View facility →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-ink)] text-white px-5 py-3 shadow-lg">
          <span className="text-[14px]">{toast}</span>
        </div>
      )}
    </Layout>
  );
}