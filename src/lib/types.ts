
export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  contact: string;
  documentUrl?: string;
}

export interface Villa {
  id: string;
  villaNumber: number;
  ownerFirstName: string;

  ownerLastName: string;
  isRented: boolean;
  tenantFirstName?: string;
  tenantLastName?: string;
  tenantContact?: string;
  contact?: string;
  mapPosition: { top: string; left: string };
}

export interface BoardMember {
  id: string;
  firstName: string;
  lastName: string;
  title: 'رئیس هیئت مدیره' | 'نایب رئیس' | 'عضو هیئت مدیره' | 'بازرس';
  contact: string;
}

export interface AppSettings {
    communityName: string;
    developerName: string;
    personnelRoles: string[];
}
