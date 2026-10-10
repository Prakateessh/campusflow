import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="py-24 text-center">
        <span className="label label-accent">404</span>
        <h1 className="mt-4 text-3xl md:text-4xl">Page not found</h1>
        <Link to="/" className="btn-link text-sm inline-block mt-6">← Back home</Link>
      </div>
    </Layout>
  );
}