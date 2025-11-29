'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiBook, FiDollarSign, FiUser, FiLogOut, FiMessageCircle } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage (set during login)
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  // Define navigation items based on role
  const getNavItems = () => {
    if (userRole === 'admin') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: FiHome },
        { href: '/students', label: 'Students', icon: FiUsers },
        { href: '/teachers', label: 'Teachers', icon: FiUser },
        { href: '/lessons', label: 'Lessons', icon: FiBook },
        { href: '/payments', label: 'Payments', icon: FiDollarSign },
        { href: '/chat', label: 'Messages', icon: FiMessageCircle },
      ];
    } else if (userRole === 'teacher') {
      return [
        { href: '/teacher-dashboard', label: 'My Dashboard', icon: FiHome },
        { href: '/lessons', label: 'Lessons', icon: FiBook },
        { href: '/chat', label: 'Messages', icon: FiMessageCircle },
      ];
    } else if (userRole === 'student') {
      return [
        { href: '/student-dashboard', label: 'My Dashboard', icon: FiHome },
        { href: '/chat', label: 'Messages', icon: FiMessageCircle },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Academy System
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
