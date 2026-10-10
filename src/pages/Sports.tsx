import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Facility {
  id: number;
  code: string;
  name: string;
  category: string;
  kind: string;
  description: string;
  location: string;
  open_hours: string | null;
}

export default function Sports() {
  const { user } = useAuth();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [activeFacility, setActiveFacility] = useState<Facility | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success
  const [success, setSuccess] = useState<{ request_id: number; facility: Facility; date: string; time: string } | null>(null);

  // Fetch sports facilities
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/facilities?kind=sports`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFacilities(data.facilities ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openBooking = (facility: Facility) => {
    setActiveFacility(facility);
    setBookingDate(new Date().toISOString().slice(0, 10));
    setBookingTime('06:00');
    setConfirmed(false);
    setFormError(null);
  };

  const closeModal = () => {
    setActiveFacility(null);
    setFormError(null);
    setConfirmed(false);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeFacility) return;
    setFormError(null);

    if (!bookingDate) {
      setFormError('Select a date.');
      return;
    }
    if (!bookingTime) {
      setFormError('Select a start time.');
      return;
    }
    if (!confirmed) {
      setFormError('Confirm the booking.');
      return;
    }

    setSubmitting(true);
    try {
      const [h, m] = bookingTime.split(':').map(Number);
      const endH = (h + 1) % 24;
      const start = `${bookingDate} ${bookingTime}:00`;
      const end = `${bookingDate} ${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'sports',
          requester_id: user.id,
          facility_id: activeFacility.id,
          title: `${activeFacility.name} — 1 hour session`,
          scheduled_start: start,
          scheduled_end: end,
          items: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Booking failed');
      }

      const data = await res.json();
      setSuccess({
        request_id: data.request_id,
        facility: activeFacility,
        date: bookingDate,
        time: bookingTime,
      });
      closeModal();
    } catch (err: any) {
      setFormError(err.message ?? 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ════════ SUCCESS SCREEN ════════
  if (success) {
    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-rule" />
            <span className="label label-accent">Booked</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">
            {success.facility.name} reserved.
          </h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Bring your student ID. Your session is scheduled for the slot below.
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label">Booking</span>
                  <span className="label num">
                    R-{String(success.request_id).padStart(4, '0')}
                  </span>
                </div>
                <dl className="divide-y divide-[var(--color-rule)]">
                  <div className="flex items-center justify-between px-6 py-4">
                    <dt className="label">Facility</dt>
                    <dd className="text-[15px]">{success.facility.name}</dd>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <dt className="label">Date</dt>
                    <dd className="text-[15px] num">{success.date}</dd>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <dt className="label">Start</dt>
                    <dd className="text-[15px] num">{success.time}</dd>
                  </div>
                  {success.facility.location && (
                    <div className="flex items-center justify-between px-6 py-4">
                      <dt className="label">Location</dt>
                      <dd className="text-[15px]">{success.facility.location}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setSuccess(null)}
                  className="btn btn-outline text-sm"
                >
                  Book another
                </button>
                <Link
                  to={`/requests/${success.request_id}`}
                  className="btn-link text-sm"
                >
                  View in requests →
                </Link>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-5">
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Note</span>
                <ul className="mt-3 space-y-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  <li>· Arrive 5 minutes early</li>
                  <li>· Carry your student ID</li>
                  <li>· Free cancellation up to 2 hours before</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </Layout>
    );
  }

  // ════════ LIST ════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Sports</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(facilities.length).padStart(2, '0')} facilities`}
          </span>
        </div>
      </section>

      <section className="pb-24">
        {error && (
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 mb-6">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Loading…</span>
          </div>
        ) : facilities.length === 0 ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">No sports facilities available</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[var(--color-rule)]">
            {facilities.map((f) => (
              <button
                key={f.id}
                onClick={() => openBooking(f)}
                className="group bg-[var(--color-card)] border-r border-b border-[var(--color-rule)] p-8 text-left transition-colors hover:bg-[var(--color-surface-low)] min-h-[280px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="label label-accent num">{f.code}</span>
                  <span className="text-[var(--color-ink-4)] group-hover:text-[var(--color-accent)] transition-colors">
                    →
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl group-hover:text-[var(--color-accent)] transition-colors">
                    {f.name}
                  </h3>
                  <p className="mt-3 text-[14px] text-[var(--color-ink-3)] leading-relaxed line-clamp-3">
                    {f.description}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-[12px] text-[var(--color-ink-4)] flex-wrap">
                    {f.location && <span>{f.location}</span>}
                    {f.open_hours && (
                      <>
                        <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                        <span className="num">{f.open_hours}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ════════ BOOKING MODAL ════════ */}
      {activeFacility && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-[var(--color-card)] border border-[var(--color-rule)] w-full max-w-lg my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <div className="flex items-center gap-3">
                <span className="label label-accent num">{activeFacility.code}</span>
                <span className="label">Book session</span>
              </div>
              <button
                onClick={closeModal}
                className="label hover:text-[var(--color-ink)] transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitBooking} className="px-6 py-6 space-y-6">
              <div>
                <h2 className="text-2xl leading-tight">{activeFacility.name}</h2>
                {activeFacility.location && (
                  <p className="mt-2 text-[13px] text-[var(--color-ink-3)]">
                    {activeFacility.location}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-2">
                    Date <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="input num"
                  />
                </div>
                <div>
                  <label className="label block mb-2">
                    Start time <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="input num"
                  />
                </div>
              </div>

              <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] leading-relaxed">
                    I confirm this slot and will carry my student ID.
                  </span>
                </label>
              </div>

              {formError && (
                <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                  <span className="text-[13px] text-[var(--color-accent)]">{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !confirmed}
                  className="btn btn-accent text-sm flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking…' : 'Confirm booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}