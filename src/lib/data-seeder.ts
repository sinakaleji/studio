'use server';

import { writeBatch, Firestore, collection, getDocs, doc } from 'firebase/firestore';

const villasData = [
    { villaNumber: 'A101', location: 'فاز ۱، خیابان یاس', size: 350, ownerName: 'خانواده رضایی' },
    { villaNumber: 'B205', location: 'فاز ۲، خیابان نرگس', size: 420, ownerName: 'خانواده محمدی' },
    { villaNumber: 'C110', location: 'فاز ۱، خیابان ارکیده', size: 380, ownerName: 'خانواده احمدی' },
    { villaNumber: 'D401', location: 'فاز ۴، خیابان لاله', size: 500, ownerName: 'خانواده کریمی' },
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

const payrollsData = [
    { personnelId: 'ReplaceWithAliKarimiId', salary: 15000000, deductions: 2000000, overtimeHours: 10, netPay: 14104167, payDate: new Date() },
    { personnelId: 'ReplaceWithMaryamHosseiniId', salary: 10000000, deductions: 1500000, overtimeHours: 5, netPay: 8864583, payDate: new Date() },
];

const estateData = {
    name: 'شهرک ویلایی سینا',
    address: 'استان مازندران، کلارآباد',
    contactNumber: '01154601234',
    email: 'info@sina-estate.com'
};
const ESTATE_DOC_ID = "main-estate-info";

async function seedCollection(firestore: Firestore, collectionName: string, data: any[], idField?: keyof any) {
  const collectionRef = collection(firestore, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) {
    console.log(`Seeding ${collectionName}...`);
    const batch = writeBatch(firestore);
    data.forEach(item => {
      // If an idField is provided and it exists in the item, use it as the document ID
      const docId = idField && item[idField] ? item[idField] : undefined;
      const docRef = docId ? doc(collectionRef, docId) : doc(collectionRef);
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
        await seedCollection(firestore, 'estates', [estateData], 'id');
        const mainEstateDocRef = doc(firestore, 'estates', ESTATE_DOC_ID);
        const batch = writeBatch(firestore);
        batch.set(mainEstateDocRef, estateData, { merge: true });
        await batch.commit();
        console.log('Estate info seeded.');


        await Promise.all([
            seedCollection(firestore, 'villas', villasData),
            seedCollection(firestore, 'personnel', personnelData),
            seedCollection(firestore, 'financial_transactions', transactionsData),
            // Payroll seeding is more complex due to personnelId dependency, can be handled post-initial seed
        ]);
        console.log("Database seeded successfully (except payrolls).");
    } catch(error) {
        console.error("Error seeding database: ", error);
    }
}
