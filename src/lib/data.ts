
import type { Personnel, Villa, BoardMember, Building } from './types';

export const mockPersonnel: Personnel[] = [
  { id: 'p1', personnelNumber: '001', firstName: 'اسحاق', lastName: 'اسحاقی', role: 'خدمات', contact: '0910-305-3794', documents: [] },
  { id: 'p2', personnelNumber: '002', firstName: 'رضا', lastName: 'کابچی', role: 'باغبان', contact: '0911-744-4694', documents: [] },
  { id: 'p3', personnelNumber: '003', firstName: 'فرهنگ', lastName: 'فرهنگی', role: 'نگهبان', contact: '0933-488-1914', documents: [] },
  { id: 'p4', personnelNumber: '004', firstName: 'ناصر', lastName: 'رمضان', role: 'نگهبان', contact: '09**-***-****', documents: [] },
];

export const mockVillas: Villa[] = [
    { id: 'v1', villaNumber: 1, ownerFirstName: 'علیرضا', ownerLastName: 'عبادی', contact: '0912-307-0435', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '10%', left: '15%' } },
    { id: 'v2', villaNumber: 2, ownerFirstName: 'شهمیری', ownerLastName: '(احمدی) لنج', contact: '0939-495-7777', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '10%', left: '35%' } },
    { id: 'v3', villaNumber: 3, ownerFirstName: 'احمدی', ownerLastName: '(احمدی) گنج', contact: '0912-114-8481', occupancyStatus: 'owner-occupied', isForSale: true, mapPosition: { top: '10%', left: '55%' } },
    { id: 'v4', villaNumber: 4, ownerFirstName: 'احمدی', ownerLastName: 'گنج', contact: '0912-112-2387', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '10%', left: '75%' } },
    { id: 'v5', villaNumber: 5, ownerFirstName: 'مندری', ownerLastName: '', contact: '0912-114-3803', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '30%', left: '15%' } },
    { id: 'v6', villaNumber: 6, ownerFirstName: 'احمدی', ownerLastName: 'لنج', contact: '0912-112-2387', occupancyStatus: 'rented', tenant: { firstName: 'علی', lastName: 'رضایی', contact: '09129876543'}, isForSale: true, mapPosition: { top: '30%', left: '35%' } },
    { id: 'v7', villaNumber: 7, ownerFirstName: 'تهرانی', ownerLastName: '', contact: '0912-477-2848', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '30%', left: '55%' } },
    { id: 'v8', villaNumber: 8, ownerFirstName: 'ظفرمندی', ownerLastName: '', contact: '0912-450-6178', occupancyStatus: 'vacant', isForSale: true, mapPosition: { top: '30%', left: '75%' } },
    { id: 'v9', villaNumber: 9, ownerFirstName: 'مهدی', ownerLastName: '(احمدی) گنج', contact: '0912-111-0100', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '50%', left: '15%' } },
    { id: 'v10', villaNumber: 10, ownerFirstName: 'عبدالهی', ownerLastName: '', contact: '0912-238-7053', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '50%', left: '35%' } },
    { id: 'v11', villaNumber: 11, ownerFirstName: 'نوید', ownerLastName: 'شمار', contact: '0912-111-4885', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '50%', left: '55%' } },
    { id: 'v12', villaNumber: 12, ownerFirstName: 'جعفری', ownerLastName: '', contact: '0912-121-9871', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '50%', left: '75%' } },
    { id: 'v13', villaNumber: 13, ownerFirstName: 'دانشور', ownerLastName: '', contact: '0912-283-0616', occupancyStatus: 'vacant', isForSale: false, mapPosition: { top: '70%', left: '15%' } },
    { id: 'v14', villaNumber: 14, ownerFirstName: 'مقدادی', ownerLastName: '', contact: '0912-114-2187', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '70%', left: '35%' } },
    { id: 'v15', villaNumber: 15, ownerFirstName: 'فورادی', ownerLastName: '', contact: '0918-334-4995', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '70%', left: '55%' } },
    { id: 'v16', villaNumber: 16, ownerFirstName: 'خدیوزاده', ownerLastName: '(قاجار)', contact: '0912-344-4541', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '70%', left: '75%' } },
    { id: 'v17', villaNumber: 17, ownerFirstName: 'شجاعی', ownerLastName: '', contact: '0912-106-3777', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '90%', left: '15%' } },
    { id: 'v18', villaNumber: 18, ownerFirstName: 'روحانی', ownerLastName: '', contact: '0912-119-5271', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '90%', left: '35%' } },
    { id: 'v19', villaNumber: 19, ownerFirstName: 'هاشمی', ownerLastName: 'جو', contact: '0913-111-2799', occupancyStatus: 'owner-occupied', isForSale: false, mapPosition: { top: '90%', left: '55%' } },
    { id: 'v20', villaNumber: 20, ownerFirstName: 'مقصودی', ownerLastName: '', contact: '0911-902-1145', occupancyStatus: 'rented', tenant: { firstName: 'مریم', lastName: 'محمدی', contact: '09351112233'}, isForSale: false, mapPosition: { top: '90%', left: '75%' } },
];

export const mockBoardMembers: BoardMember[] = [
  { id: 'b1', firstName: 'سینا', lastName: 'کالجی', title: 'رئیس هیئت مدیره', contact: '09112223344' },
  { id: 'b2', firstName: 'آزاده', lastName: 'شریفی', title: 'نایب رئیس', contact: '09128765432' },
  { id: 'b3', firstName: 'منصور', lastName: 'پناهی', title: 'عضو هیئت مدیره', contact: '09134567890' },
];

export const mockBuildings: Building[] = [
    { id: 'bldg1', name: 'دفتر مدیریت', type: 'office', mapPosition: { top: '5%', left: '5%' } },
    { id: 'bldg2', name: 'اتاق نگهبانی', type: 'security', mapPosition: { top: '95%', left: '95%' } },
];
