package com.medtrak.app.enhancedreminders;

import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EnhancedReminders")
public class EnhancedRemindersPlugin extends Plugin {

    private static final String TAG = "EnhancedRemindersPlugin";
    private EnhancedReminderNotificationHelper notificationHelper;
    private TtsHelper ttsHelper;

    @Override
    public void load() {
        super.load();
        Context context = getContext();
        notificationHelper = new EnhancedReminderNotificationHelper(context);
        ttsHelper = new TtsHelper(context);
        Log.d(TAG, "EnhancedReminders plugin loaded");
    }

    @PluginMethod
    public void initializeTts(PluginCall call) {
        try {
            ttsHelper.initialize();
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize TTS", e);
            call.reject("Failed to initialize TTS", e);
        }
    }

    @PluginMethod
    public void scheduleEnhancedReminder(PluginCall call) {
        try {
            int id = call.getInt("id");
            String key = call.getString("key");
            String medicationName = call.getString("medicationName");
            String dosage = call.getString("dosage");
            String time = call.getString("time");
            long triggerAtMillis = call.getLong("triggerAtMillis");

            notificationHelper.scheduleEnhancedReminder(id, key, medicationName, dosage, time, triggerAtMillis);
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule enhanced reminder", e);
            call.reject("Failed to schedule enhanced reminder", e);
        }
    }

    @PluginMethod
    public void cancelEnhancedReminder(PluginCall call) {
        try {
            int id = call.getInt("id");
            notificationHelper.cancelReminder(id);
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to cancel enhanced reminder", e);
            call.reject("Failed to cancel enhanced reminder", e);
        }
    }

    @PluginMethod
    public void cancelAllEnhancedReminders(PluginCall call) {
        try {
            notificationHelper.cancelAllReminders();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to cancel all enhanced reminders", e);
            call.reject("Failed to cancel all enhanced reminders", e);
        }
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject result = new JSObject();
        // Full-screen intents require Android 10 (API 29)+
        boolean supported = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q;
        result.put("supported", supported);
        call.resolve(result);
    }

    @PluginMethod
    public void speak(PluginCall call) {
        try {
            String text = call.getString("text");
            String language = call.getString("language", "en-US");
            ttsHelper.speak(text, language);
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to speak", e);
            call.reject("Failed to speak", e);
        }
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        ttsHelper.stop();
        call.resolve();
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // Android 13+: request notification permission
                getActivity().requestPermissions(
                    new String[]{android.Manifest.permission.POST_NOTIFICATIONS},
                    1001 // request code
                );
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to request notification permission", e);
            call.reject("Failed to request notification permission", e);
        }
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
                if (alarmManager != null && !alarmManager.canScheduleExactAlarms()) {
                    // Open the exact alarm settings screen
                    Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                }
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to request exact alarm permission", e);
            call.reject("Failed to request exact alarm permission", e);
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        try {
            JSObject result = new JSObject();
            
            // Check notification permission
            boolean notificationGranted = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notificationGranted = getContext().checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) 
                    == android.content.pm.PackageManager.PERMISSION_GRANTED;
            } else {
                notificationGranted = true; // Pre-Android 13 doesn't need runtime permission
            }
            result.put("notification", notificationGranted ? "granted" : "denied");
            
            // Check exact alarm permission
            boolean exactAlarmGranted = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
                if (alarmManager != null) {
                    exactAlarmGranted = alarmManager.canScheduleExactAlarms();
                }
            } else {
                exactAlarmGranted = true; // Pre-Android 12 doesn't need this permission
            }
            result.put("exactAlarm", exactAlarmGranted ? "granted" : "denied");
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to check permissions", e);
            call.reject("Failed to check permissions", e);
        }
    }

    public EnhancedReminderNotificationHelper getNotificationHelper() {
        return notificationHelper;
    }

    public TtsHelper getTtsHelper() {
        return ttsHelper;
    }
}