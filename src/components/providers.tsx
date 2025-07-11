
'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';

// This component wraps all client-side providers
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The admin layout handles its own header and footer
  if (pathname.startsWith('/admin')) {
    return (
       <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
              {children}
              <Toaster />
          </AuthProvider>
      </ThemeProvider>
    )
  }

  // Regular app layout with Navbar and Footer
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {/* We can't pass server-fetched props like logoUrl here directly.
            The Navbar will need to be a client component and fetch its own data,
            or the data needs to be loaded into a client-side store/context.
            For now, we remove the prop and let the Navbar use its default. */}
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
