'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, useFirebase, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { seedDatabase } from '@/lib/data-seeder';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/signup'];

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const { firestore } = useFirebase();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isUserLoading || !firestore) {
        return; // Wait for user and firestore to be available
      }

      if (user) {
        // User is logged in, check their role.
        const userDocRef = doc(firestore, 'users', user.uid);
        let userDocSnap = await getDoc(userDocRef);
        let userRole = userDocSnap.exists() ? userDocSnap.data().role : null;
        
        // SPECIAL FIX: Assign super_admin role if not present for the specific email
        if (user.email === 'sinakaleji@gmail.com' && userRole !== 'super_admin') {
            await setDoc(userDocRef, { role: 'super_admin' }, { merge: true });
            // Re-fetch the doc to get the updated role
            userDocSnap = await getDoc(userDocRef);
            userRole = userDocSnap.data()?.role;
        }

        if (userRole) {
          // User has a role, they can access protected pages.
          if (publicPaths.includes(pathname) || pathname === '/') {
            router.replace('/dashboard');
          }
        } else {
          // User has no role, they should only be on the root page.
          if (pathname !== '/') {
            router.replace('/');
          }
        }
      } else {
        // User is not logged in.
        if (!publicPaths.includes(pathname)) {
          router.replace('/login');
        }
      }
      setIsAuthCheckComplete(true);
    };
    checkAuthAndRedirect();
  }, [user, isUserLoading, router, pathname, firestore]);
  
  if (!isAuthCheckComplete) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className='mr-2'>در حال بارگذاری...</p>
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
    const setup = async () => {
        if(firebaseServices.firestore && firebaseServices.auth) {
            await seedDatabase(firebaseServices.firestore);
        }
    }
    setup();
  }, [firebaseServices]);

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
