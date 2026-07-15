import { Capacitor, registerPlugin } from '@capacitor/core';

type PlayInlineInstallPluginType = {
    checkPlayStoreAvailability(): Promise<{ playStoreAvailable: boolean }>;
    getAppSetId(): Promise<{ appSetId: string; scope: string }>;
    checkForUpdates(): Promise<{ updateAvailable: boolean; updateAvailability: number; availableVersionCode: number }>;
    openPlayStore(options: { packageName?: string }): Promise<void>;
};

const PlayInlineInstall = registerPlugin<PlayInlineInstallPluginType>('PlayInlineInstall', {
    web: () => ({
        async checkPlayStoreAvailability() {
            return { playStoreAvailable: false };
        },
        async getAppSetId() {
            return { appSetId: '', scope: '' };
        },
        async checkForUpdates() {
            return { updateAvailable: false, updateAvailability: 0, availableVersionCode: 0 };
        },
        async openPlayStore() {
            if (typeof window !== 'undefined') {
                const url = 'https://play.google.com/store/apps/details?id=' + (window.location.hostname || 'com.sistemafacturacion.celu');
                window.open(url, '_blank');
            }
        }
    })
});

export const checkPlayStoreAvailability = async () => PlayInlineInstall.checkPlayStoreAvailability();
export const getAppSetId = async () => PlayInlineInstall.getAppSetId();
export const checkForUpdates = async () => PlayInlineInstall.checkForUpdates();
export const openPlayStore = async (options: { packageName?: string }) => PlayInlineInstall.openPlayStore(options);
