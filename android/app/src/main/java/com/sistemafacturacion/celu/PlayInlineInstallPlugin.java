package com.sistemafacturacion.celu;

import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "PlayInlineInstall")
public class PlayInlineInstallPlugin extends Plugin {
    public void checkPlayStoreAvailability(PluginCall call) {
        boolean available = getContext().getPackageManager().getLaunchIntentForPackage("com.android.vending") != null;
        JSObject result = new JSObject();
        result.put("playStoreAvailable", available);
        call.resolve(result);
    }

    public void getAppSetId(PluginCall call) {
        JSObject result = new JSObject();
        result.put("appSetId", "");
        result.put("scope", "");
        call.resolve(result);
    }

    public void checkForUpdates(PluginCall call) {
        AppUpdateManager appUpdateManager = AppUpdateManagerFactory.create(getContext());
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            JSObject result = new JSObject();
            result.put("updateAvailable", appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE);
            result.put("updateAvailability", appUpdateInfo.updateAvailability());
            result.put("availableVersionCode", appUpdateInfo.availableVersionCode());
            call.resolve(result);
        }).addOnFailureListener(error -> {
            call.reject("Unable to check for updates", error);
        });
    }

    public void openPlayStore(PluginCall call) {
        String packageName = call.getString("packageName", getContext().getPackageName());
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + packageName));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception fallbackError) {
                call.reject("Unable to open Google Play Store", fallbackError);
            }
        }
    }
}
