import type { AppSettings } from './types';

const SETTINGS_KEY = 'appSettings';

const defaultSettings: AppSettings = {
    communityName: "نیلارز",
    developerName: "سینا رایانه",
};

export function getSettings(): AppSettings {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }
    try {
        const settingsStr = localStorage.getItem(SETTINGS_KEY);
        if (settingsStr) {
            return JSON.parse(settingsStr);
        }
    } catch (error) {
        console.error("Failed to read settings from localStorage", error);
    }
    return defaultSettings;
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
