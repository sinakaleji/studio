import type { Personnel, Villa, BoardMember } from './types';

export const mockPersonnel: Personnel[] = [
  { id: 'p1', name: 'علی رضایی', role: 'نگهبان', contact: '09123456789' },
  { id: 'p2', name: 'مریم حسینی', role: 'خدمات', contact: '09123456788' },
  { id: 'p3', name: 'حسن محمدی', role: 'باغبان', contact: '09123456787' },
  { id: 'p4', name: 'رضا قاسمی', role: 'نگهبان', contact: '09123456786' },
  { id: 'p5', name: 'سعید احمدی', role: 'نگهبان', contact: '09123456785' },
];

export const mockVillas: Villa[] = [
  { id: 'v1', villaNumber: 101, ownerName: 'فرهاد اکبری', isRented: false, mapPosition: { top: '15%', left: '20%' } },
  { id: 'v2', villaNumber: 102, ownerName: 'زهرا مرادی', isRented: true, tenantName: 'کاوه نجفی', tenantContact: '09351234567', mapPosition: { top: '18%', left: '45%' } },
  { id: 'v3', villaNumber: 103, ownerName: 'پریسا کاظمی', isRented: false, mapPosition: { top: '22%', left: '70%' } },
  { id: 'v4', villaNumber: 201, ownerName: 'داریوش صالحی', isRented: false, mapPosition: { top: '50%', left: '15%' } },
  { id: 'v5', villaNumber: 202, ownerName: 'سارا عزیزی', isRented: true, tenantName: 'آرش کریمی', tenantContact: '09361234568', mapPosition: { top: '55%', left: '50%' } },
  { id: 'v6', villaNumber: 203, ownerName: 'نیما یوسفی', isRented: false, mapPosition: { top: '60%', left: '78%' } },
];

export const mockBoardMembers: BoardMember[] = [
  { id: 'b1', name: 'سینا کالجی', title: 'رئیس هیئت مدیره', contact: '09112223344' },
  { id: 'b2', name: 'آزاده شریفی', title: 'نایب رئیس', contact: '09128765432' },
  { id: 'b3', name: 'منصور پناهی', title: 'عضو هیئت مدیره', contact: '09134567890' },
];
