'use server';

import { writeBatch, Firestore, collection, getDocs, doc } from 'firebase/firestore';

const stakeholdersData = [
    { id: 'sh_rezaei', name: 'خانواده رضایی', email: 'rezaei@email.com', contactNumber: '09121111111' },
    { id: 'sh_mohammadi', name: 'خانواده محمدی', email: 'mohammadi@email.com', contactNumber: '09122222222' },
    { id: 'sh_ahmadi', name: 'خانواده احمدی', email: 'ahmadi@email.com', contactNumber: '09123333333' },
    { id: 'sh_karimi', name: 'خانواده کریمی', email: 'karimi@email.com', contactNumber: '09124444444' },
    { id: 'sh_moradi', name: 'خانواده مرادی', email: 'moradi@email.com', contactNumber: '09125555555' },
];

const villasData = [
    { villaNumber: 'A101', location: 'فاز ۱، خیابان یاس', size: 350, ownerId: 'sh_rezaei', ownerName: 'خانواده رضایی' },
    { villaNumber: 'B205', location: 'فاز ۲، خیابان نرگس', size: 420, ownerId: 'sh_mohammadi', ownerName: 'خانواده محمدی' },
    { villaNumber: 'C110', location: 'فاز ۱، خیابان ارکیده', size: 380, ownerId: 'sh_ahmadi', ownerName: 'خانواده احمدی' },
    { villaNumber: 'D401', location: 'فاز ۴، خیابان لاله', size: 500, ownerId: 'sh_karimi', ownerName: 'خانواده کریمی' },
];

const personnelData = [
    { id: 'p_alikarimi', firstName: 'علی', lastName: 'کریمی', jobTitle: 'مدیر داخلی', contactNumber: '09121112233' },
    { id: 'p_maryamhosseini', firstName: 'مریم', lastName: 'حسینی', jobTitle: 'مسئول پذیرش', contactNumber: '09124445566' },
    { id: 'p_rezasadeghi', firstName: 'رضا', lastName: 'صادقی', jobTitle: 'نگهبان', contactNumber: '09127778899' },
    { id: 'p_saramoradi', firstName: 'سارا', lastName: 'مرادی', jobTitle: 'باغبان', contactNumber: '09120001122' },
];

const transactionsData = [
    { description: 'شارژ ماهانه ویلا A101', amount: 500000, type: 'income', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { description: 'هزینه باغبانی و فضای سبز', amount: 2500000, type: 'expense', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { description: 'پرداخت حقوق پرسنل (آبان)', amount: 55000000, type: 'expense', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { description: 'شارژ ماهانه ویلا B205', amount: 750000, type: 'income', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { description: 'خرید تجهیزات نظافتی', amount: 1200000, type: 'expense', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { description: 'شارژ ماهانه ویلا C110', amount: 600000, type: 'income', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
];

const payrollsData = [
    { personnelId: 'p_alikarimi', salary: 15000000, deductions: 2000000, overtimeHours: 10, netPay: 14104167, payDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { personnelId: 'p_maryamhosseini', salary: 10000000, deductions: 1500000, overtimeHours: 5, netPay: 8864583, payDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
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
      const docId = idField && item[idField] ? String(item[idField]) : undefined;
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
        const mainEstateDocRef = doc(firestore, 'estates', ESTATE_DOC_ID);
        const batch = writeBatch(firestore);
        batch.set(mainEstateDocRef, estateData, { merge: true });
        await batch.commit();
        console.log('Estate info seeded.');

        await Promise.all([
            seedCollection(firestore, 'stakeholders', stakeholdersData, 'id'),
            seedCollection(firestore, 'personnel', personnelData, 'id'),
        ]);
        
        await Promise.all([
            seedCollection(firestore, 'villas', villasData),
            seedCollection(firestore, 'financial_transactions', transactionsData),
            seedCollection(firestore, 'payrolls', payrollsData)
        ]);

        console.log("Database seeded successfully.");
    } catch(error) {
        console.error("Error seeding database: ", error);
    }
}
