'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const { firestore, auth } = useFirebase();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_no_role' | 'authenticated_with_role'>('loading');

  useEffect(() => {
    if (isUserLoading) {
      setStatus('loading');
      return;
    }

    if (!user) {
      setStatus('unauthenticated');
      router.replace('/login');
      return;
    }

    const checkUserRole = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().role) {
        setStatus('authenticated_with_role');
        router.replace('/dashboard');
      } else {
        setStatus('authenticated_no_role');
      }
    };

    checkUserRole();

  }, [user, isUserLoading, router, firestore]);

  const handleSignOut = () => {
    if (auth) {
        auth.signOut();
    }
  }

  if (status === 'loading' || status === 'authenticated_with_role' || status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">در حال بارگذاری و بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated_no_role') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-4">
            <h1 className="text-xl font-semibold">حساب کاربری شما در انتظار تایید است</h1>
            <p className="text-muted-foreground max-w-md">
                ثبت‌نام شما با موفقیت انجام شده است. برای دسترسی به پنل مدیریت، حساب کاربری شما باید توسط مدیر سیستم تایید و نقش مناسب به آن اختصاص داده شود.
            </p>
             <p className="text-sm text-muted-foreground">
                ایمیل شما: {user?.email}
            </p>
            <Button onClick={handleSignOut} variant="outline">خروج از حساب کاربری</Button>
        </div>
      </div>
    )
  }

  return null; // Should not be reached
}
