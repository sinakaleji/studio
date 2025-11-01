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
          // Wait for user and firestore to be available
          return;
      }

      if (user) {
        // User is logged in, check their role.
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userRole = userDocSnap.exists() ? userDocSnap.data().role : null;

        if (userRole) {
          // User has a role, they can access protected pages.
          // If they are on a public page, redirect to dashboard.
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
        // If not on a public page, redirect to login.
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
  }, [firebaseServices.firestore, firebaseServices.auth]);

  // Temporary effect to fix the super_admin role assignment
  useEffect(() => {
    const fixSuperAdmin = async () => {
      const { auth, firestore } = firebaseServices;
      if (auth && firestore) {
        // This will run when the auth state changes (e.g., on login)
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user && user.email === 'sinakaleji@gmail.com') {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            // Check if role is not already set to prevent unnecessary writes
            if (!userDoc.exists() || userDoc.data()?.role !== 'super_admin') {
              try {
                await setDoc(userDocRef, { role: 'super_admin' }, { merge: true });
                console.log("Successfully assigned super_admin role to sinakaleji@gmail.com");
                // Force a reload to ensure AuthGuard re-evaluates the new role
                window.location.reload();
              } catch (e) {
                console.error("Failed to assign super_admin role:", e);
              }
            }
          }
        });
        // Cleanup subscription on component unmount
        return () => unsubscribe();
      }
    };

    fixSuperAdmin();
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
