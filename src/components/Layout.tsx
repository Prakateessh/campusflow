import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-6 md:px-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}