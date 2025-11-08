// src/components/Navigation.tsx - PRODUCTION READY
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Target, Clock, Settings, HelpCircle, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: Users },   
  { href: '/match', label: 'Match', icon: Target },
  { href: '/match/history', label: 'History', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TalentPlus
              </span>
              <p className="text-xs text-gray-500 -mt-1">AI Resume Matcher</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || 
                (href !== '/dashboard' && pathname.startsWith(href));
              
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden space-x-1">
            {navItems.slice(0, 4).map(({ href, icon: Icon }) => {
              const isActive = pathname === href || 
                (href !== '/dashboard' && pathname.startsWith(href));
              
              return (
                <Link
                  key={href}
                  href={href}
                  className={`p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav (Optional) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || 
              (href !== '/dashboard' && pathname.startsWith(href));
            
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-purple-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}