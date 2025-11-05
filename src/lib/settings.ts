
import type { AppSettings } from './types';
import { exportSelectedData as exportData, importAllData as importData, ALL_DATA_KEYS } from './data-manager';


const SETTINGS_KEY = 'appSettings';
const AUTO_BACKUP_KEY = 'autoBackup';

const defaultSettings: AppSettings = {
    communityName: "نیلارز",
    developerName: "سینا رایانه",
    personnelRoles: ['نگهبان', 'خدمات', 'باغبان', 'مدیر', 'مسئول تاسیسات', 'نظافتچی'],
};

export function getSettings(): AppSettings {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }
    try {
        const settingsStr = localStorage.getItem(SETTINGS_KEY);
        if (settingsStr) {
            const storedSettings = JSON.parse(settingsStr);
            // Ensure personnelRoles exists for backward compatibility
            if (!storedSettings.personnelRoles) {
                storedSettings.personnelRoles = defaultSettings.personnelRoles;
            }
            return storedSettings;
        } else {
             // If nothing in localStorage, set and return default
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
            return defaultSettings;
        }
    } catch (error) {
        console.error("Failed to read settings from localStorage", error);
         // Fallback to default and try to save it
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
}

export function saveSettings(settings: AppSettings) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
}


export function exportSelectedData(keys: string[]) {
    return exportData(keys);
}

export function importAllData(data: { [key: string]: any }) {
    importData(data);
}

// --- Auto Backup ---

export function setupAutoBackup() {
    if (typeof window === 'undefined') {
        return () => {}; // Return a no-op function for SSR
    }

    const backupInterval = setInterval(() => {
        try {
            const allData = exportData(ALL_DATA_KEYS);
            localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(allData));
        } catch (error) {
            console.error("Auto-backup failed:", error);
        }
    }, 5000); // Backup every 5 seconds

    return () => clearInterval(backupInterval); // Return a function to clean up the interval
}

export function getAutoBackup(): { [key: string]: any } | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const backupData = localStorage.getItem(AUTO_BACKUP_KEY);
    if (backupData) {
        try {
            return JSON.parse(backupData);
        } catch (error) {
            console.error("Failed to parse auto-backup data:", error);
            return null;
        }
    }
    return null;
}

export function restoreFromAutoBackup() {
    const backupData = getAutoBackup();
    if (backupData) {
        importAllData(backupData);
        return true;
    }
    return false;
}
