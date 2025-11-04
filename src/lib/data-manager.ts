
'use client';

import { mockVillas, mockPersonnel, mockBoardMembers } from "./data";
import type { Villa, Personnel, BoardMember } from "./types";

const VILLAS_KEY = 'villas';
const PERSONNEL_KEY = 'personnel';
const BOARD_MEMBERS_KEY = 'boardMembers';

type DataType = 'villas' | 'personnel' | 'boardMembers';

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
        [BOARD_MEMBERS_KEY]: mockBoardMembers
    };
    if (typeof window === 'undefined') {
        return mockMap[key] as T[];
    }
    return initializeData(key, (mockMap as any)[key]);
}

function saveData<T>(key: DataType, data: T[]) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save data for ${key}`, error);
    }
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
