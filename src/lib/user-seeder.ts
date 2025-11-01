'use server';

import { Auth } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'sinakaleji@gmail.com';
// The password is not needed if the user is already created, but we keep it for reference.
const SUPER_ADMIN_PASSWORD = 'Sina4694'; 

export async function seedSuperAdmin(auth: Auth, firestore: Firestore) {
  try {
    // Check if a user document with the super_admin role already exists for this email.
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', SUPER_ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);

    let superAdminDocExists = false;
    let userIdToUpdate: string | null = null;

    querySnapshot.forEach(doc => {
      userIdToUpdate = doc.id;
      if (doc.data().role === 'super_admin') {
        superAdminDocExists = true;
      }
    });

    if (superAdminDocExists) {
      // console.log('Super admin already exists and has the correct role. Seeding skipped.');
      return;
    }

    if (userIdToUpdate) {
      // The user exists in Firestore, but doesn't have the super_admin role. Let's give it to them.
      console.log(`User with email ${SUPER_ADMIN_EMAIL} found in Firestore. Updating role to super_admin...`);
      const userDocRef = doc(firestore, 'users', userIdToUpdate);
      await setDoc(userDocRef, { role: 'super_admin' }, { merge: true });
      console.log('Super admin role updated successfully.');
    } else {
        // This block is for a rare case where the user exists in Auth but not in Firestore at all.
        // We can't get user by email from client Auth SDK, so we rely on the user logging in,
        // which will trigger the creation of their user doc in Firestore via the signup/login flow.
        // The safest approach is to let the user log in. After they log in, their user doc will be created
        // with `role: null`. Then, on the next app load, the logic above will assign them the super_admin role.
        console.log(`No user document found for ${SUPER_ADMIN_EMAIL} in Firestore. The user should log in once to create their profile, and the role will be assigned on the next session.`);
    }

  } catch (error) {
    console.error('Error during super admin seeding process:', error);
  }
}
