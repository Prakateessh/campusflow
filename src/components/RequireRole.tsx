import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth, type Role } from '../lib/auth';

interface Props {
  children: ReactElement;
  allow: Role[];
}

export default function RequireRole({ children, allow }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <span className="label">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}