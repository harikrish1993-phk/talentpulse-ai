// src/components/Navigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Target,
  Send,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  History,
  Database
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  submenu?: { label: string; href: string; }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
    submenu: [
      { label: 'All Jobs', href: '/jobs' },
      { label: 'Create Job', href: '/jobs/new' },
      { label: 'Active Jobs', href: '/jobs?status=active' },
      { label: 'Closed Jobs', href: '/jobs?status=closed' }
    ]
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Building2,
    submenu: [
      { label: 'All Clients', href: '/clients' },
      { label: 'Add Client', href: '/clients/new' }
    ]
  },
  {
    label: 'Library',
    href: '/library',
    icon: Database
  },
  {
    label: 'Match',
    href: '/match',
    icon: Target,
    submenu: [
      { label: 'New Match', href: '/match' },
      { label: 'Match History', href: '/match/history' }
    ]
  },
  {
    label: 'Submissions',
    href: '/submissions',
    icon: Send
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings
  },
  {
    label: 'Help',
    href: '/help',
    icon: HelpCircle
  }
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleSubmenu = (label: string) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentPlus
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Link>

                  {/* Dropdown Submenu */}
                  {item.submenu && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Your Account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentPlus
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="py-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        toggleSubmenu(item.label);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 flex-1"
                      onClick={(e) => {
                        if (item.submenu) e.preventDefault();
                        else setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    {item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          activeSubmenu === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Mobile Submenu */}
                  {item.submenu && activeSubmenu === item.label && (
                    <div className="bg-gray-50 border-t border-b border-gray-200">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-12 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
    </>
  );
}