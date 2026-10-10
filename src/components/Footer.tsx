export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-card)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[var(--color-accent)]" />
          <span className="label">© Amrita Vishwa Vidyapeetham · Ettimadai Campus</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="label hover:text-[var(--color-ink)] transition">Help</a>
          <a href="#" className="label hover:text-[var(--color-ink)] transition">Feedback</a>
          <a href="#" className="label hover:text-[var(--color-ink)] transition">Sign out</a>
        </div>
      </div>
    </footer>
  );
}