'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/signin');
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-2">Create an Account 🌟</h2>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-purple-600 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSignUp}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-400"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-400"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition duration-200" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/signin">
            <Button variant="outline" className="w-full border border-gray-300 rounded-xl py-2 hover:bg-gray-100">
              ⬅ Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
