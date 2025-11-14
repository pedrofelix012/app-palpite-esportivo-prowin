'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trophy, LayoutDashboard, Crown, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user || pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'VIP', icon: Crown, path: '/vip' },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block text-gray-900 dark:text-white">
              Sports Predictions
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
              {user.isVip && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Membro VIP
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="px-4 py-2">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  {user.isVip && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                      <Crown className="w-3 h-3" />
                      Membro VIP
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 flex items-center justify-center gap-2"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
