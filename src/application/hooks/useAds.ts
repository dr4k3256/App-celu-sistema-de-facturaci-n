import { useEffect } from 'react';
import { AdMob, AdOptions, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const INTERSTITIAL_ID = 'ca-app-pub-9052649043235197/2910377556';
const MINUTES_BETWEEN_ADS = 5;
const LAST_AD_KEY = 'last_ad_time';

const shouldShowAd = (): boolean => {
    const lastStr = localStorage.getItem(LAST_AD_KEY);
    if (!lastStr) return true;
    const elapsed = Date.now() - parseInt(lastStr, 10);
    return elapsed >= MINUTES_BETWEEN_ADS * 60 * 1000;
};

export const useAds = () => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let adLoaded = false;
        let adInitialized = false;
        const listeners: Array<() => void> = [];

        const options: AdOptions = {
            adId: INTERSTITIAL_ID,
            isTesting: true,
        };

        const safePrepare = async () => {
            try {
                adLoaded = false;
                await AdMob.prepareInterstitial(options);
            } catch (e) {
                console.error('Error preparing interstitial', e);
            }
        };

        const showAdIfReady = async () => {
            if (!adLoaded || !shouldShowAd()) return;
            try {
                await AdMob.showInterstitial();
            } catch (e) {
                console.error('Error showing interstitial', e);
            }
        };

        const setupAd = async () => {
            try {
                await AdMob.initialize();
                adInitialized = true;

                const loadedListener = AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
                    adLoaded = true;
                    await showAdIfReady();
                });

                const failedToLoadListener = AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (event) => {
                    adLoaded = false;
                    console.warn('AdMob failed to load interstitial', event);
                });

                const dismissedListener = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
                    adLoaded = false;
                    localStorage.setItem(LAST_AD_KEY, Date.now().toString());
                    await safePrepare();
                });

                listeners.push(() => loadedListener.remove());
                listeners.push(() => failedToLoadListener.remove());
                listeners.push(() => dismissedListener.remove());

                await safePrepare();
            } catch (e) {
                console.error('AdMob init error', e);
            }
        };

        setupAd();

        const handleAppResume = async () => {
            if (!adInitialized) return;
            if (shouldShowAd()) {
                await safePrepare();
            }
        };

        const pushListener = async (eventName: string, callback: () => void) => {
            try {
                const listener = await App.addListener(eventName, callback);
                listeners.push(() => listener.remove());
            } catch (e) {
                console.error(`App listener ${eventName} error`, e);
            }
        };

        pushListener('appStateChange', handleAppResume);
        pushListener('resume', handleAppResume);

        return () => {
            listeners.forEach((remove) => remove());
            AdMob.removeAllListeners();
        };
    }, []);
};
