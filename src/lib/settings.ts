import type { AppSettings } from './types';

const SETTINGS_KEY = 'appSettings';

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
