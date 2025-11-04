export interface Personnel {
  id: string;
  name: string;
  role: 'نگهبان' | 'خدمات' | 'باغبان' | 'مدیر';
  contact: string;
}

export interface Villa {
  id: string;
  villaNumber: number;
  ownerName: string;
  isRented: boolean;
  tenantName?: string;
  tenantContact?: string;
  mapPosition: { top: string; left: string };
}

export interface BoardMember {
  id: string;
  name: string;
  title: 'رئیس هیئت مدیره' | 'نایب رئیس' | 'عضو هیئت مدیره' | 'بازرس';
  contact: string;
}
