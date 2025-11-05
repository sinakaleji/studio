
'use client';

import { mockVillas, mockPersonnel, mockBoardMembers, mockBuildings } from "./data";
import type { Villa, Personnel, BoardMember, Building } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

const VILLAS_KEY = 'villas';
const PERSONNEL_KEY = 'personnel';
const BOARD_MEMBERS_KEY = 'boardMembers';
const BUILDINGS_KEY = 'buildings';
const MAP_IMAGE_URL_KEY = 'mapImageUrl';

type DataType = 'villas' | 'personnel' | 'boardMembers' | 'buildings';

const ALL_DATA_KEYS = [VILLAS_KEY, PERSONNEL_KEY, BOARD_MEMBERS_KEY, BUILDINGS_KEY];

function initializeData<T>(key: string, mockData: T[]): T[] {
    if (typeof window === 'undefined') {
        return mockData;
    }
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            localStorage.setItem(key, JSON.stringify(mockData));
            return mockData;
        }
    } catch (error) {
        console.error(`Failed to initialize data for ${key}`, error);
        return mockData;
    }
}

function getData<T>(key: DataType): T[] {
    const mockMap = {
        [VILLAS_KEY]: mockVillas,
        [PERSONNEL_KEY]: mockPersonnel,
        [BOARD_MEMBERS_KEY]: mockBoardMembers,
        [BUILDINGS_KEY]: mockBuildings
    };
    if (typeof window === 'undefined') {
        return mockMap[key] as T[];
    }
    return initializeData(key, (mockMap as any)[key]);
}

function saveData<T>(key: DataType | string, data: T[] | string) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save data for ${key}`, error);
    }
}

// --- Backup and Restore ---
export function exportAllData() {
  if (typeof window === 'undefined') {
    return {};
  }
  const allData: { [key: string]: any } = {};
  ALL_DATA_KEYS.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      allData[key] = JSON.parse(data);
    }
  });
  return allData;
}

export function importAllData(data: { [key: string]: any }) {
    if (typeof window === 'undefined') {
        return;
    }
    ALL_DATA_KEYS.forEach(key => {
        if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
        }
    });
}


// --- Villas ---
export function getVillas(): Villa[] {
    return getData<Villa>(VILLAS_KEY);
}

export function saveVillas(villas: Villa[]) {
    saveData<Villa>(VILLAS_KEY, villas);
}

// --- Personnel ---
export function getPersonnel(): Personnel[] {
    return getData<Personnel>(PERSONNEL_KEY);
}

export function savePersonnel(personnel: Personnel[]) {
    saveData<Personnel>(PERSONNEL_KEY, personnel);
}

// --- Board Members ---
export function getBoardMembers(): BoardMember[] {
    return getData<BoardMember>(BOARD_MEMBERS_KEY);
}

export function saveBoardMembers(boardMembers: BoardMember[]) {
    saveData<BoardMember>(BOARD_MEMBERS_KEY, boardMembers);
}

// --- Buildings ---
export function getBuildings(): Building[] {
    return getData<Building>(BUILDINGS_KEY);
}

export function saveBuildings(buildings: Building[]) {
    saveData<Building>(BUILDINGS_KEY, buildings);
}

// --- Map Image URL ---
export function getMapImageUrl(): string {
  if (typeof window === 'undefined') {
    return PlaceHolderImages.find(img => img.id === 'schematic-map')?.imageUrl || "";
  }
  const storedUrl = localStorage.getItem(MAP_IMAGE_URL_KEY);
  if (storedUrl) {
    // Check if the stored URL is a JSON string or a plain string
    try {
      const parsed = JSON.parse(storedUrl);
      return typeof parsed === 'string' ? parsed : defaultUrl;
    } catch (e) {
      // It's likely a plain string
      return storedUrl;
    }
  }
  const defaultUrl = PlaceHolderImages.find(img => img.id === 'schematic-map')?.imageUrl || "";
  localStorage.setItem(MAP_IMAGE_URL_KEY, defaultUrl);
  return defaultUrl;
}

export function saveMapImageUrl(url: string) {
  if (typeof window === 'undefined') {
      return;
  }
  try {
      localStorage.setItem(MAP_IMAGE_URL_KEY, url);
  } catch (error) {
      console.error(`Failed to save data for ${MAP_IMAGE_URL_KEY}`, error);
  }
}
