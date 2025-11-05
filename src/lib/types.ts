

export interface Document {
  name: string;
  url: string;
}

export interface Personnel {
  id: string;
  personnelNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  contact: string;
  documents?: Document[];
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

export interface Building {
  id: string;
  name: string;
  type: 'security' | 'facility' | 'office' | 'other';
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
