'use server';

import { Auth } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'sinakaleji@gmail.com';

/**
 * This seeder is now deprecated and the logic is handled directly in `signup/page.tsx`
 * and a temporary fix in `client-provider.tsx`.
 * We keep the file to avoid breaking any potential imports, but it does nothing.
 */
export async function seedSuperAdmin(auth: Auth, firestore: Firestore) {
    // Deprecated. The logic for the primary super admin is now handled on signup
    // and via a temporary fix in the client provider for existing users.
}
