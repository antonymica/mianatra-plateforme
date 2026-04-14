import type { PropsWithChildren } from 'react';

import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
