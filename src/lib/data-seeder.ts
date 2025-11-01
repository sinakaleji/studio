'use server';

import { writeBatch, Firestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
    { id: 'p_alikarimi', firstName: 'علی', lastName: 'کریمی', jobTitle: 'مدیر داخلی', baseSalary: 15000000, numberOfChildren: 2, isMarried: true, contactNumber: '09121112233', accountNumber: 'IR123456789012345678901234', insuranceNumber: '1234567890' },
    { id: 'p_maryamhosseini', firstName: 'مریم', lastName: 'حسینی', jobTitle: 'مسئول پذیرش', baseSalary: 10000000, numberOfChildren: 0, isMarried: false, contactNumber: '09124445566', accountNumber: 'IR234567890123456789012345', insuranceNumber: '2345678901' },
    { id: 'p_rezasadeghi', firstName: 'رضا', lastName: 'صادقی', jobTitle: 'نگهبان', baseSalary: 9500000, numberOfChildren: 1, isMarried: true, contactNumber: '09127778899', accountNumber: 'IR345678901234567890123456', insuranceNumber: '3456789012' },
    { id: 'p_saramoradi', firstName: 'سارا', lastName: 'مرادی', jobTitle: 'باغبان', baseSalary: 9000000, numberOfChildren: 0, isMarried: false, contactNumber: '09120001122', accountNumber: 'IR456789012345678901234567', insuranceNumber: '4567890123' },
];

const transactionsData = [
    { description: 'شارژ ماهانه ویلا A101', amount: 500000, type: 'income', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { description: 'هزینه باغبانی و فضای سبز', amount: 2500000, type: 'expense', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { description: 'پرداخت حقوق پرسنل (مهر)', amount: 55000000, type: 'expense', date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) },
    { description: 'شارژ ماهانه ویلا B205', amount: 750000, type: 'income', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { description: 'خرید تجهیزات نظافتی', amount: 1200000, type: 'expense', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { description: 'شارژ ماهانه ویلا C110', amount: 600000, type: 'income', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { description: 'پرداخت قبض برق عمومی', amount: 3500000, type: 'expense', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
];

const estateData = {
    name: 'شهرک ویلایی سینا',
    address: 'استان مازندران، کلارآباد',
    contactNumber: '01154601234',
    email: 'info@sina-estate.com'
};
const ESTATE_DOC_ID = "main-estate-info";

const payrollSettingsData = {
    insuranceRate: 7, // 7%
    taxBrackets: [
        { from: 0, to: 103909680, rate: 0 },
        { from: 103909681, to: 140000000, rate: 10 },
        { from: 140000001, to: 230000000, rate: 15 },
        { from: 230000001, to: 340000000, rate: 20 },
        { from: 340000001, to: Infinity, rate: 30 },
    ],
    monthlyHousingAllowance: 9000000,
    monthlyFoodAllowance: 22000000,
    monthlySeniorityBase: 2820000,
    marriageAllowance: 5000000,
    perChildAllowance: 10390968, // This is based on image but seems high for per child. It's likely the total for a specific case. Using it as per-child for now.
};
const PAYROLL_SETTINGS_DOC_ID = 'default';

async function seedCollection(firestore: Firestore, collectionName: string, data: any[], idField?: keyof any) {
  const collectionRef = collection(firestore, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) {
    console.log(`Seeding ${collectionName}...`);
    const batch = writeBatch(firestore);
    data.forEach(item => {
      let docRef;
      if(idField && item[idField]) {
         const id = String(item[idField]);
         docRef = doc(collectionRef, id);
      } else {
         docRef = doc(collectionRef);
      }
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log(`${collectionName} seeded successfully.`);
  } else {
    console.log(`${collectionName} already has data, skipping seed.`);
  }
}

async function seedSingleDoc(firestore: Firestore, collectionName: string, docId: string, data: any) {
    const docRef = doc(firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        console.log(`Seeding document ${collectionName}/${docId}...`);
        await writeBatch(firestore).set(docRef, data).commit();
        console.log(`Document ${collectionName}/${docId} seeded successfully.`);
    } else {
        console.log(`Document ${collectionName}/${docId} already exists, merging data...`);
        await writeBatch(firestore).set(docRef, data, { merge: true }).commit();
        console.log(`Document ${collectionName}/${docId} merged successfully.`);
    }
}


export async function seedDatabase(firestore: Firestore) {
    try {
        await Promise.all([
            seedSingleDoc(firestore, 'estates', ESTATE_DOC_ID, estateData),
            seedSingleDoc(firestore, 'payroll_settings', PAYROLL_SETTINGS_DOC_ID, payrollSettingsData)
        ]);

        await Promise.all([
            seedCollection(firestore, 'stakeholders', stakeholdersData, 'id'),
            seedCollection(firestore, 'personnel', personnelData, 'id'),
        ]);
        
        await Promise.all([
            seedCollection(firestore, 'villas', villasData),
            seedCollection(firestore, 'financial_transactions', transactionsData),
        ]);

        console.log("Database seeding process completed.");
    } catch(error) {
        console.error("Error seeding database: ", error);
    }
}
