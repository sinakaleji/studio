import type { Personnel, Villa, BoardMember } from './types';

export const mockPersonnel: Personnel[] = [
  { id: 'p1', name: 'علی رضایی', role: 'نگهبان', contact: '09123456789' },
  { id: 'p2', name: 'مریم حسینی', role: 'خدمات', contact: '09123456788' },
  { id: 'p3', name: 'حسن محمدی', role: 'باغبان', contact: '09123456787' },
  { id: 'p4', name: 'رضا قاسمی', role: 'نگهبان', contact: '09123456786' },
  { id: 'p5', name: 'سعید احمدی', role: 'نگهبان', contact: '09123456785' },
];

export const mockVillas: Villa[] = [
    { id: 'v1', villaNumber: 1, ownerName: 'علیرضا عبادی', contact: '09123070435', isRented: false, mapPosition: { top: '10%', left: '15%' } },
    { id: 'v2', villaNumber: 2, ownerName: 'شهمیری (احمدی) گنج', contact: '09394957777', isRented: false, mapPosition: { top: '10%', left: '35%' } },
    { id: 'v3', villaNumber: 3, ownerName: 'احمدی (احمدی) گنج', contact: '09121148481', isRented: false, mapPosition: { top: '10%', left: '55%' } },
    { id: 'v4', villaNumber: 4, ownerName: 'احمدی گنج', contact: '09121122387', isRented: false, mapPosition: { top: '10%', left: '75%' } },
    { id: 'v5', villaNumber: 5, ownerName: 'مندری', contact: '09121143803', isRented: false, mapPosition: { top: '30%', left: '15%' } },
    { id: 'v6', villaNumber: 6, ownerName: 'احمدی گنج', contact: '09121122387', isRented: false, mapPosition: { top: '30%', left: '35%' } },
    { id: 'v7', villaNumber: 7, ownerName: 'تهرانی', contact: '09124772848', isRented: false, mapPosition: { top: '30%', left: '55%' } },
    { id: 'v8', villaNumber: 8, ownerName: 'ظفرمندی', contact: '09124506178', isRented: false, mapPosition: { top: '30%', left: '75%' } },
    { id: 'v9', villaNumber: 9, ownerName: 'مهدی (احمدی) گنج', contact: '09121110100', isRented: false, mapPosition: { top: '50%', left: '15%' } },
    { id: 'v10', villaNumber: 10, ownerName: 'عبدالهی', contact: '09122387053', isRented: false, mapPosition: { top: '50%', left: '35%' } },
    { id: 'v11', villaNumber: 11, ownerName: 'نوید شمار', contact: '09121114885', isRented: false, mapPosition: { top: '50%', left: '55%' } },
    { id: 'v12', villaNumber: 12, ownerName: 'جعفری', contact: '09121219871', isRented: false, mapPosition: { top: '50%', left: '75%' } },
    { id: 'v13', villaNumber: 13, ownerName: 'دانشور', contact: '09122830616', isRented: false, mapPosition: { top: '70%', left: '15%' } },
    { id: 'v14', villaNumber: 14, ownerName: 'مقدادی', contact: '09121142187', isRented: false, mapPosition: { top: '70%', left: '35%' } },
    { id: 'v15', villaNumber: 15, ownerName: 'فورادی', contact: '09183344995', isRented: false, mapPosition: { top: '70%', left: '55%' } },
    { id: 'v16', villaNumber: 16, ownerName: 'خدیوزاده (قاجار)', contact: '09123444541', isRented: false, mapPosition: { top: '70%', left: '75%' } },
    { id: 'v17', villaNumber: 17, ownerName: 'شجاعی', contact: '09121063777', isRented: false, mapPosition: { top: '90%', left: '15%' } },
    { id: 'v18', villaNumber: 18, ownerName: 'روحانی', contact: '09121195271', isRented: false, mapPosition: { top: '90%', left: '35%' } },
    { id: 'v19', villaNumber: 19, ownerName: 'هاشمی جو', contact: '09131112799', isRented: false, mapPosition: { top: '90%', left: '55%' } },
    { id: 'v20', villaNumber: 20, ownerName: 'مقصودی', contact: '09119021145', isRented: false, mapPosition: { top: '90%', left: '75%' } },
];


export const mockBoardMembers: BoardMember[] = [
  { id: 'b1', name: 'سینا کالجی', title: 'رئیس هیئت مدیره', contact: '09112223344' },
  { id: 'b2', name: 'آزاده شریفی', title: 'نایب رئیس', contact: '09128765432' },
  { id: 'b3', name: 'منصور پناهی', title: 'عضو هیئت مدیره', contact: '09134567890' },
];
