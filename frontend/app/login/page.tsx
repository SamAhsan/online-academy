'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { FiUser, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userRole', response.role);

      // Redirect based on role
      if (response.role === 'admin') {
        router.push('/dashboard');
      } else if (response.role === 'teacher') {
        router.push('/teacher-dashboard');
      } else if (response.role === 'student') {
        router.push('/student-dashboard');
      } else {
        router.push('/dashboard'); // Default fallback
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Online Academy</h1>
          <p className="text-gray-600 mt-2">Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input pl-10"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>

          <div className="text-sm text-gray-600 border-t pt-4">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p className="font-mono bg-gray-100 p-1 rounded">Admin: admin / admin123</p>
              <p className="font-mono bg-gray-100 p-1 rounded">Teacher: teacher / teacher123</p>
              <p className="font-mono bg-gray-100 p-1 rounded">Student: student / student123</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              Contact admin to create your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
