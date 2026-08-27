package com.medtrak.app.enhancedreminders;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.medtrak.app.R;

public class EnhancedReminderNotificationHelper {

    private static final String TAG = "EnhancedNotificationHelper";
    private static final String CHANNEL_ID = "medtrak-enhanced-reminders";
    private static final String CHANNEL_NAME = "Enhanced Medication Reminders";
    private static final String CHANNEL_DESCRIPTION = "Full-screen alarms with voice for medication doses";

    private final Context context;
    private final NotificationManager notificationManager;
    private final AlarmManager alarmManager;

    public EnhancedReminderNotificationHelper(Context context) {
        this.context = context.getApplicationContext();
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        this.alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // High importance for heads-up / full-screen
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(CHANNEL_DESCRIPTION);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 200, 500});
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            // Critical for full-screen intent: bypass Do Not Disturb
            channel.setBypassDnd(true);
            
            // Set custom sound if available
            Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/raw/medtrak_reminder");
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            channel.setSound(soundUri, audioAttributes);

            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "Created notification channel: " + CHANNEL_ID);
        }
    }

    public void scheduleEnhancedReminder(int id, String key, String medicationName, String dosage, String time, long triggerAtMillis) {
        // Create the full-screen intent that launches FullScreenAlarmActivity
        Intent fullScreenIntent = new Intent(context, FullScreenAlarmActivity.class);
        fullScreenIntent.putExtra("notification_id", id);
        fullScreenIntent.putExtra("dose_key", key);
        fullScreenIntent.putExtra("medication_name", medicationName);
        fullScreenIntent.putExtra("dosage", dosage);
        fullScreenIntent.putExtra("time", time);
        fullScreenIntent.putExtra("language", java.util.Locale.getDefault().toLanguageTag());
        fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        // Use FLAG_IMMUTABLE for Android 12+ (API 31+)
        int pendingIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            pendingIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
        } else {
            pendingIntentFlags |= PendingIntent.FLAG_ONE_SHOT;
        }

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            id,
            fullScreenIntent,
            pendingIntentFlags
        );

        // Also create a content intent for when user taps the notification normally
        Intent contentIntent = new Intent(context, FullScreenAlarmActivity.class);
        contentIntent.putExtra("notification_id", id);
        contentIntent.putExtra("dose_key", key);
        contentIntent.putExtra("medication_name", medicationName);
        contentIntent.putExtra("dosage", dosage);
        contentIntent.putExtra("time", time);
        contentIntent.putExtra("language", java.util.Locale.getDefault().toLanguageTag());
        contentIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent contentPendingIntent = PendingIntent.getActivity(
            context,
            id + 10000, // Different request code
            contentIntent,
            pendingIntentFlags
        );

        // Create action intents for "Taken", "Skip", "Snooze"
        PendingIntent takenAction = createActionIntent(id, "taken", key);
        PendingIntent skipAction = createActionIntent(id, "skip", key);
        PendingIntent snoozeAction = createActionIntent(id, "snooze", key);

        // Build the notification data to pass to the receiver (don't pass Notification as Parcelable)
        Intent alarmIntent = new Intent(context, EnhancedRemindersReceiver.class);
        alarmIntent.setAction("com.medtrak.app.ENHANCED_REMINDER_TRIGGER");
        alarmIntent.putExtra("notification_id", id);
        alarmIntent.putExtra("dose_key", key);
        alarmIntent.putExtra("medication_name", medicationName);
        alarmIntent.putExtra("dosage", dosage);
        alarmIntent.putExtra("time", time);
        alarmIntent.putExtra("language", java.util.Locale.getDefault().toLanguageTag());

        PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(
            context,
            id,
            alarmIntent,
            pendingIntentFlags
        );

        // Schedule exact alarm
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                alarmPendingIntent
            );
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                alarmPendingIntent
            );
        } else {
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                alarmPendingIntent
            );
        }

        Log.d(TAG, "Scheduled enhanced reminder id=" + id + " for " + medicationName + " at " + triggerAtMillis);
    }

    private PendingIntent createActionIntent(int notificationId, String action, String doseKey) {
        Intent intent = new Intent(context, EnhancedRemindersReceiver.class);
        intent.setAction("com.medtrak.app.ENHANCED_REMINDER_ACTION");
        intent.putExtra("notification_id", notificationId);
        intent.putExtra("action", action);
        intent.putExtra("dose_key", doseKey);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        return PendingIntent.getBroadcast(context, notificationId + action.hashCode(), intent, flags);
    }

    public void cancelReminder(int id) {
        // Cancel the alarm
        Intent alarmIntent = new Intent(context, EnhancedRemindersReceiver.class);
        alarmIntent.setAction("com.medtrak.app.ENHANCED_REMINDER_TRIGGER");

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(context, id, alarmIntent, flags);
        alarmManager.cancel(alarmPendingIntent);

        // Cancel the notification if shown
        notificationManager.cancel(id);

        Log.d(TAG, "Cancelled enhanced reminder id=" + id);
    }

    public void cancelAllReminders() {
        // Cancel all alarms by iterating through possible IDs
        // In practice, we'd track scheduled IDs, but for now cancel all notifications
        notificationManager.cancelAll();
        Log.d(TAG, "Cancelled all enhanced reminders");
    }

    private int getSmallIcon() {
        // Use the app's launcher icon or a custom one
        return context.getApplicationInfo().icon;
    }

    private int getIconRes(String name) {
        // Return a drawable resource ID - for now use system icons
        // In production, you'd add custom drawables
        switch (name) {
            case "ic_check": return android.R.drawable.ic_menu_save;
            case "ic_close": return android.R.drawable.ic_menu_close_clear_cancel;
            case "ic_snooze": return android.R.drawable.ic_lock_idle_alarm;
            default: return android.R.drawable.ic_menu_info_details;
        }
    }
}