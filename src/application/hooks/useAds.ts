import { useEffect } from 'react';
import { AdMob, AdOptions, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const INTERSTITIAL_ID = 'ca-app-pub-9052649043235197/2910377556';
const MINUTES_BETWEEN_ADS = 5;
const LAST_AD_KEY = 'last_ad_time';

// Returns true if the ad should be shown (first time ever, or 5+ minutes have passed)
const shouldShowAd = (): boolean => {
    const lastStr = localStorage.getItem(LAST_AD_KEY);
    if (!lastStr) return true; // First open → always show
    const elapsed = Date.now() - parseInt(lastStr, 10);
    return elapsed >= MINUTES_BETWEEN_ADS * 60 * 1000;
};

export const useAds = () => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let adLoaded = false;

        const options: AdOptions = {
            adId: INTERSTITIAL_ID,
            isTesting: false,
        };

        const setupAd = async () => {
            try {
                await AdMob.initialize();

                // When ad finishes loading → show it right away if it's time
                AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
                    adLoaded = true;
                    if (shouldShowAd()) {
                        try {
                            await AdMob.showInterstitial();
                        } catch (e) {
                            console.error('Error showing interstitial', e);
                        }
                    }
                });

                // When user closes the ad → save timestamp and pre-load next one
                AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
                    adLoaded = false;
                    localStorage.setItem(LAST_AD_KEY, Date.now().toString());
                    try {
                        await AdMob.prepareInterstitial(options);
                    } catch (e) {
                        console.error('Error pre-loading next interstitial', e);
                    }
                });

                // Kick off: load ad on start — Loaded listener above will show it
                await AdMob.prepareInterstitial(options);

            } catch (e) {
                console.error('AdMob init error', e);
            }
        };

        setupAd();

        // When app comes back to foreground
        const handleResume = async () => {
            if (!shouldShowAd()) return;
            if (adLoaded) {
                try {
                    await AdMob.showInterstitial();
                } catch (e) {
                    console.error('Error showing ad on resume', e);
                }
            } else {
                // Not loaded yet → prepare (Loaded listener will show it)
                try {
                    await AdMob.prepareInterstitial(options);
                } catch (e) {
                    console.error('Error preparing ad on resume', e);
                }
            }
        };

        document.addEventListener('resume', handleResume);

        return () => {
            document.removeEventListener('resume', handleResume);
            AdMob.removeAllListeners();
        };
    }, []);
};
