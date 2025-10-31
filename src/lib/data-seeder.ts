'use server';

import { addDocumentNonBlocking } from '@/firebase';
import { collection, getDocs, writeBatch, Firestore } from 'firebase/firestore';

const villasData = [
    { villaNumber: 'A101', location: 'فاز ۱، خیابان یاس', size: 350, ownerName: 'خانواده رضایی' },
    { villaNumber: 'B205', location: 'فاز ۲، خیابان نرگس', size: 420, ownerName: 'خانواده محمدی' },
    { villaNumber: 'C110', location: 'فاز ۱، خیابان ارکیده', size: 380, ownerName: 'خانواده احمدی' },
];

const personnelData = [
    { firstName: 'علی', lastName: 'کریمی', jobTitle: 'مدیر داخلی', contactNumber: '09121112233' },
    { firstName: 'مریم', lastName: 'حسینی', jobTitle: 'مسئول پذیرش', contactNumber: '09124445566' },
    { firstName: 'رضا', lastName: 'صادقی', jobTitle: 'نگهبان', contactNumber: '09127778899' },
    { firstName: 'سارا', lastName: 'مرادی', jobTitle: 'باغبان', contactNumber: '09120001122' },
];

const transactionsData = [
    { description: 'شارژ ماهانه ویلا A101', amount: 500000, type: 'income', date: new Date() },
    { description: 'هزینه باغبانی و فضای سبز', amount: 2500000, type: 'expense', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { description: 'پرداخت حقوق پرسنل', amount: 55000000, type: 'expense', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { description: 'شارژ ماهانه ویلا B205', amount: 750000, type: 'income', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];

async function seedCollection(firestore: Firestore, collectionName: string, data: any[]) {
  const collectionRef = collection(firestore, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) {
    console.log(`Seeding ${collectionName}...`);
    const batch = writeBatch(firestore);
    data.forEach(item => {
      const docRef = collectionRef.doc();
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log(`${collectionName} seeded successfully.`);
  } else {
    console.log(`${collectionName} already has data, skipping seed.`);
  }
}

export async function seedDatabase(firestore: Firestore) {
    try {
        await Promise.all([
            seedCollection(firestore, 'villas', villasData),
            seedCollection(firestore, 'personnel', personnelData),
            seedCollection(firestore, 'financial_transactions', transactionsData),
        ]);
    } catch(error) {
        console.error("Error seeding database: ", error);
    }
}
