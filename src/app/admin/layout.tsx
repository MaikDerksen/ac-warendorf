
"use client"; // Required for context and client-side auth logic

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck, LogIn, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle'; // Assuming ModeToggle is client component compatible

function AdminHeaderContent() {
  const { user, loading, signInWithGoogle, signOutUser, isAdmin } = useAuth();

  return (
    <div className="flex items-center gap-4 ml-auto">
      <ModeToggle />
      {loading ? (
        <Button variant="ghost" size="icon" disabled>
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      ) : user ? (
        <>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email} {isAdmin && (<span className="text-primary font-semibold">(Admin)</span>)}
          </span>
           <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
            <AvatarFallback>
              {user.email ? user.email[0].toUpperCase() : <UserCircle className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={signOutUser}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle} size="sm">
          <LogIn className="mr-2 h-4 w-4" /> Login mit Google
        </Button>
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>AC Warendorf Admin</span>
          </Link>
          <AdminHeaderContent />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
        <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
          Adminbereich &copy; {new Date().getFullYear()} AC Warendorf
        </footer>
      </div>
    </AuthProvider>
  );
}
