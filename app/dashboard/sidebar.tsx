'use client';

import SignOutButton from '@/app/(Auth)/SignOutButton';
import RevalidateButton from '@/components/revalidateButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard Home', href: '/dashboard', emoji: '🏠' },
  { label: 'Common Number', href: '/dashboard/common-number', emoji: '📋' },
  { label: 'Teer Results', href: '/dashboard/teer-result-today', emoji: '📊' },
  { label: 'Dream Number', href: '/dashboard/dream-number', emoji: '💭' },
  { label: 'Meta Settings', href: '/dashboard/meta-settings', emoji: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-green-800 via-green-900 to-black text-white flex flex-col shadow-2xl z-50 overflow-y-auto">
      {/* Sidebar Inner Content */}
      <div className="flex flex-col p-6 min-h-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-wide leading-tight select-none">
            Admin Panel
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {navItems.map(({ href, label, emoji }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md scale-[1.02]'
                      : 'text-white hover:bg-green-700 hover:text-white hover:scale-[1.01]'
                  }`}
              >
                <span className="text-xl">{emoji}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

         {/* Revalidate Button */}
        <div className="mt-6">
          <RevalidateButton />
        </div>

        {/* Sign Out Button */}
        <div className="mt-8">
          <SignOutButton />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-xs text-green-300 border-t border-green-700 select-none">
          &copy; {new Date().getFullYear()} Your Company
        </div>
      </div>
    </aside>
  );
}
