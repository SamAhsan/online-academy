'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'username' | 'reset'>('username');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(username);
      setUserEmail(response.email);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'User not found. Please check your username.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(username, newPassword);
      alert('Password reset successful! You can now login with your new password.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'username'
              ? 'Enter your username to reset your password'
              : 'Enter your new password'
            }
          </p>
        </div>

        {step === 'username' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCheckUsername}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 block">
                Back to Login
              </Link>
              <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-500 block">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Password reset for: <strong>{username}</strong>
                <br />
                Email: {userEmail}
              </p>
            </div>

            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="New Password (min 6 characters)"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm New Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('username')}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}