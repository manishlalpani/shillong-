'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar/page';
import Footer from '@/components/footer/page';
import { AuthProvider } from '@/context/AuthContext'; // <-- Wrap the entire layout

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbarFooter =
    pathname?.startsWith("/dashboard") ||
    pathname === "/signin" ||
    pathname === "/signup";

  return (
    <AuthProvider>
      {!hideNavbarFooter && <Navbar /> }
      {children}
      {!hideNavbarFooter && <Footer />}
    </AuthProvider>
  );
}
