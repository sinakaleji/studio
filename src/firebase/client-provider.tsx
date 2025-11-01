'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { seedDatabase } from '@/lib/data-seeder';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/signup'];

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const { firestore } = initializeFirebase();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!isUserLoading) {
        if (user) {
           const userDocRef = doc(firestore, 'users', user.uid);
           const userDocSnap = await getDoc(userDocRef);
           if (!userDocSnap.exists() && pathname !== '/signup') {
             // This might be a new user, send them to finish signup if profile doesn't exist
             // Or maybe they were deleted. For now, let's keep it simple.
           }

          if (publicPaths.includes(pathname)) {
            router.replace('/dashboard');
          }
        } else {
          // If user is not logged in and not on a public page, redirect to login
          if (!publicPaths.includes(pathname)) {
            router.replace('/login');
          }
        }
        setIsAuthCheckComplete(true);
      }
    };
    checkAuthAndRedirect();
  }, [user, isUserLoading, router, pathname, firestore]);
  
  if (!isAuthCheckComplete && !publicPaths.includes(pathname)) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              {/* You can replace this with a more sophisticated loading spinner */}
              <p>Loading...</p>
          </div>
      );
  }

  return <>{children}</>;
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 
  
  useEffect(() => {
    if(firebaseServices.firestore) {
      seedDatabase(firebaseServices.firestore);
    }
  }, [firebaseServices.firestore]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGuard>
        {children}
      </AuthGuard>
    </FirebaseProvider>
  );
}
