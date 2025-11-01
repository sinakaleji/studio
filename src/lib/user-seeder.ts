'use server';

import { Auth } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * This seeder is now deprecated.
 * The logic for the primary super admin is now handled on signup/login.
 */
export async function seedSuperAdmin(auth: Auth, firestore: Firestore) {
    // Deprecated.
}
