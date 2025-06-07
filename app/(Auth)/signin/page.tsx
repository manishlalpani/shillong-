'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { authorizedEmails } from '@/lib/authorizedUsers';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      if (authorizedEmails.includes(userEmail!)) {
        router.push('/dashboard');
      } else {
        alert('Not Authorized Person');
        await auth.signOut();
      }
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (authorizedEmails.includes(userEmail!)) {
        router.push('/dashboard');
      } else {
        alert('Not Authorized Person');
        await auth.signOut();
      }
    } catch {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-2">Welcome Back 👋</h2>
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/signup" className="text-purple-600 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSignIn}>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 rounded-xl py-2 hover:bg-gray-100"
          >
            Continue with Google
          </Button>
        </form>
      </div>
    </div>
  );
}
