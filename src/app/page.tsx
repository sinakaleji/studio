'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPER_ADMIN_EMAIL = 'sinakaleji@gmail.com';
const publicPaths = ['/login', '/signup'];

export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const { firestore, auth } = useFirebase();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [statusMessage, setStatusMessage] = useState('در حال بارگذاری و بررسی دسترسی...');

  useEffect(() => {
    if (isUserLoading || !firestore) {
      return; 
    }

    if (!user) {
      setStatus('unauthenticated');
      if (!publicPaths.includes(window.location.pathname)) {
        router.replace('/login');
      } else {
        setStatus('idle'); 
      }
      return;
    }
    
    const checkUserRole = async () => {
      setStatusMessage('در حال بررسی نقش کاربر...');
      const userDocRef = doc(firestore, 'users', user.uid);
      
      try {
        let userDocSnap = await getDoc(userDocRef);

        if (user.email === SUPER_ADMIN_EMAIL) {
          if (!userDocSnap.exists() || userDocSnap.data()?.role !== 'super_admin') {
            setStatusMessage('در حال اختصاص نقش سوپر ادمین...');
            const userData = { role: 'super_admin', email: user.email, uid: user.uid };
            
            setDoc(userDocRef, userData, { merge: true })
              .then(async () => {
                 const updatedSnap = await getDoc(userDocRef);
                 if (updatedSnap.exists() && updatedSnap.data()?.role) {
                    setStatus('authenticated_with_role');
                    router.replace('/dashboard');
                  } else {
                     // This case should ideally not be hit if setDoc is successful
                     setStatus('authenticated_no_role');
                  }
              })
              .catch(error => {
                const contextualError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'write',
                  requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', contextualError);
                // Keep the user on a pending/error page
                setStatus('permission_denied');
                setStatusMessage('خطا در اختصاص دسترسی. لطفاً با مدیر سیستم تماس بگیرید.');
              });
            return; // Exit after initiating the async setDoc
          }
        }
        
        if (userDocSnap.exists() && userDocSnap.data()?.role) {
          setStatus('authenticated_with_role');
          router.replace('/dashboard');
        } else {
          setStatus('authenticated_no_role');
        }
      } catch (error) {
         console.error("Error checking user role:", error);
         setStatus('permission_denied'); // Generic error state
         setStatusMessage('خطایی در بررسی نقش کاربری رخ داد.');
      }
    };

    checkUserRole();

  }, [user, isUserLoading, firestore, router]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.replace('/login');
    }
  }
  
  if (status === 'unauthenticated' && publicPaths.includes(window.location.pathname)) {
    return null;
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">{statusMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated_no_role' || status === 'permission_denied') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-4">
            <h1 className="text-xl font-semibold">{status === 'permission_denied' ? 'دسترسی رد شد' : 'حساب کاربری شما در انتظار تایید است'}</h1>
            <p className="text-muted-foreground max-w-md">
                {status === 'permission_denied' 
                 ? 'شما مجوز لازم برای انجام این عملیات را ندارید. لطفاً با مدیر سیستم تماس بگیرید.'
                 : 'ثبت‌نام شما با موفقیت انجام شده است. برای دسترسی به پنل مدیریت، حساب کاربری شما باید توسط مدیر سیستم تایید و نقش مناسب به آن اختصاص داده شود.'
                }
            </p>
             <p className="text-sm text-muted-foreground">
                ایمیل شما: {user?.email}
            </p>
            <Button onClick={handleSignOut} variant="outline">خروج از حساب کاربری</Button>
        </div>
      </div>
    )
  }

  // This will be shown briefly while redirecting for authenticated users with roles
  if(status === 'authenticated_with_role'){
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">خوش آمدید! در حال انتقال به داشبورد...</p>
        </div>
      </div>
    );
  }

  return null;
}
