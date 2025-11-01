'use server';

import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'sinakaleji@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Sina4694'; 

export async function seedSuperAdmin(auth: Auth, firestore: Firestore) {
  try {
    // 1. Check if the super admin user already exists by email in Firestore
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', SUPER_ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Super admin with email ${SUPER_ADMIN_EMAIL} not found in Firestore. Proceeding to create...`);
      
      // 2. Create the user in Firebase Auth. This also signs the user in.
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
        const user = userCredential.user;
        console.log('Super admin created in Auth, UID:', user.uid);

        // 3. Create the user profile in Firestore with the 'super_admin' role
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'super_admin',
          displayName: 'Super Admin'
        });
        console.log('Super admin profile created in Firestore with role.');

        // 4. IMPORTANT: Sign the temporary user out immediately.
        // This prevents the auth state from being prematurely picked up by the client provider
        // before the app is fully ready, which can cause redirect loops.
        // The user will then log in normally through the login page.
        await auth.signOut();
        console.log('Temporary super admin creation session signed out.');

      } catch (error: any) {
         if (error.code === 'auth/email-already-in-use') {
            console.log(`Auth user with email ${SUPER_ADMIN_EMAIL} already exists, but Firestore doc might be missing or was deleted. This state is unusual but can be recovered from if the user logs in.`);
         } else if (error.code === 'auth/weak-password') {
            console.error('Super admin password is too weak. Please use a stronger password.');
         }
         else {
            console.error('Error creating super admin user in Auth:', error);
         }
      }
    } else {
    //   console.log('Super admin already exists. Seeding skipped.');
    }
  } catch (error) {
    console.error('Error during super admin seeding process:', error);
  }
}
