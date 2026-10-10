import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <section className="py-32 text-center">
        <span className="label label-accent">404</span>
        <h1 className="mt-6 text-4xl md:text-5xl leading-tight">
          Page not found.
        </h1>
        <p className="mt-6 text-[16px] text-[var(--color-ink-2)] max-w-md mx-auto leading-relaxed">
          The page you requested doesn't exist or has been moved.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link to="/" className="btn btn-accent text-sm">
            Back to home
          </Link>
          <Link to="/facilities" className="btn btn-ghost text-sm">
            Browse facilities
          </Link>
        </div>
      </section>
    </Layout>
  );
}