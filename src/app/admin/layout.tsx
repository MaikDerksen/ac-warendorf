import type { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span>AC Warendorf Admin</span>
        </Link>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0">
        {children}
      </main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        Adminbereich &copy; {new Date().getFullYear()} AC Warendorf
      </footer>
    </div>
  );
}
