'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Make sure this path points to your initialized Firebase Auth instance

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign the user out
      router.push('/signin'); // Redirect to signin page
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-left"
      onClick={handleSignOut}
    >
      👋 Sign Out
    </Button>
  );
}
