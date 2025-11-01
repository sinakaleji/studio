'use server';

import { Auth } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'sinakaleji@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Sina4694'; 

export async function seedSuperAdmin(auth: Auth, firestore: Firestore) {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', SUPER_ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);

    let userId: string | null = null;
    let userHasSuperAdminRole = false;

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      if (userDoc.data().role === 'super_admin') {
        userHasSuperAdminRole = true;
      }
    }
    
    if (userHasSuperAdminRole) {
      // console.log('Super admin role is already correctly assigned.');
      return;
    }

    if (userId) {
      // User exists in Firestore, but role is not super_admin. Update it.
      console.log(`Found user ${SUPER_ADMIN_EMAIL} in Firestore. Assigning super_admin role...`);
      const userDocRef = doc(firestore, 'users', userId);
      await setDoc(userDocRef, { role: 'super_admin' }, { merge: true });
      console.log('Super admin role assigned successfully.');
    } else {
      // This case should not happen if the user has logged in at least once,
      // as the login/signup flow creates the user document.
      // However, as a fallback, we check if we can find the user UID from auth,
      // but client SDK doesn't support getUserByEmail. We have to rely on the
      // user document being created first.
       console.log(`User document for ${SUPER_ADMIN_EMAIL} not found. The user must log in once for their document to be created so the role can be assigned.`);
    }

  } catch (error) {
    console.error('Error during super admin seeding process:', error);
  }
}
