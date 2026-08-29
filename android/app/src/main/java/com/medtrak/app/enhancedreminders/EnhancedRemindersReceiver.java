package com.medtrak.app.enhancedreminders;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.medtrak.app.R;

public class EnhancedRemindersReceiver extends BroadcastReceiver {

    private static final String TAG = "EnhancedRemindersReceiver";
    private static final String CHANNEL_ID = "medtrak-enhanced-reminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received action: " + action);

        if (action == null) return;

        switch (action) {
            case "com.medtrak.app.ENHANCED_REMINDER_TRIGGER":
                handleTrigger(context, intent);
                break;
            case "com.medtrak.app.ENHANCED_REMINDER_ACTION":
                handleAction(context, intent);
                break;
            case Intent.ACTION_BOOT_COMPLETED:
            case "android.intent.action.QUICKBOOT_POWERON":
                handleBootCompleted(context);
                break;
        }
    }

    private void handleTrigger(Context context, Intent intent) {
        int notificationId = intent.getIntExtra("notification_id", -1);
        String doseKey = intent.getStringExtra("dose_key");
        String medicationName = intent.getStringExtra("medication_name");
        String dosage = intent.getStringExtra("dosage");
        String time = intent.getStringExtra("time");
        String language = intent.getStringExtra("language");

        if (medicationName == null || dosage == null) {
            Log.w(TAG, "Missing medication info for id: " + notificationId);
            return;
        }

        // Build the full-screen intent that launches FullScreenAlarmActivity
        Intent fullScreenIntent = new Intent(context, FullScreenAlarmActivity.class);
        fullScreenIntent.putExtra("notification_id", notificationId);
        fullScreenIntent.putExtra("dose_key", doseKey);
        fullScreenIntent.putExtra("medication_name", medicationName);
        fullScreenIntent.putExtra("dosage", dosage);
        fullScreenIntent.putExtra("time", time);
        fullScreenIntent.putExtra("language", language);
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
            notificationId,
            fullScreenIntent,
            pendingIntentFlags
        );

        // Also create a content intent for when user taps the notification normally
        Intent contentIntent = new Intent(context, FullScreenAlarmActivity.class);
        contentIntent.putExtra("notification_id", notificationId);
        contentIntent.putExtra("dose_key", doseKey);
        contentIntent.putExtra("medication_name", medicationName);
        contentIntent.putExtra("dosage", dosage);
        contentIntent.putExtra("time", time);
        contentIntent.putExtra("language", language);
        contentIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent contentPendingIntent = PendingIntent.getActivity(
            context,
            notificationId + 10000, // Different request code
            contentIntent,
            pendingIntentFlags
        );

        // Create action intents for "Taken", "Skip", "Snooze"
        PendingIntent takenAction = createActionIntent(context, notificationId, "taken", doseKey);
        PendingIntent skipAction = createActionIntent(context, notificationId, "skip", doseKey);
        PendingIntent snoozeAction = createActionIntent(context, notificationId, "snooze", doseKey);

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(getSmallIcon(context))
            .setContentTitle(context.getString(R.string.medication_due))
            .setContentText(medicationName + " — " + dosage)
            .setStyle(new NotificationCompat.BigTextStyle()
                .bigText(medicationName + "\n" + dosage + " · " + context.getString(R.string.scheduled_for) + " " + time))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(contentPendingIntent)
            .setAutoCancel(true)
            .setOngoing(false)
            .setOnlyAlertOnce(true)
            .addAction(new NotificationCompat.Action.Builder(
                getIconRes(context, "ic_check"), 
                context.getString(R.string.mark_taken), 
                takenAction).build())
            .addAction(new NotificationCompat.Action.Builder(
                getIconRes(context, "ic_close"), 
                context.getString(R.string.skip), 
                skipAction).build())
            .addAction(new NotificationCompat.Action.Builder(
                getIconRes(context, "ic_snooze"), 
                context.getString(R.string.snooze_10min), 
                snoozeAction).build());

        // Set sound
        Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/raw/medtrak_reminder");
        builder.setSound(soundUri);

        Notification notification = builder.build();
        notification.flags |= Notification.FLAG_INSISTENT;

        // Show the notification (this will trigger the full-screen intent)
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(notificationId, notification);

        Log.d(TAG, "Triggered enhanced reminder notification id=" + notificationId);
    }

    private void handleAction(Context context, Intent intent) {
        int notificationId = intent.getIntExtra("notification_id", -1);
        String action = intent.getStringExtra("action");
        String doseKey = intent.getStringExtra("dose_key");

        if (action == null) return;

        Log.d(TAG, "Handling action: " + action + " for notification: " + notificationId);

        // Cancel the notification
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancel(notificationId);

        // Persist the action so it can be mirrored to the app even if the web
        // view bridge is not currently listening (app backgrounded or killed).
        ActionStore.persist(context, notificationId, action, doseKey);

        // Send result to JS via broadcast
        Intent resultIntent = new Intent("com.medtrak.app.ENHANCED_REMINDER_RESULT");
        resultIntent.putExtra("notification_id", notificationId);
        resultIntent.putExtra("action", action);
        resultIntent.putExtra("dose_key", doseKey);
        context.sendBroadcast(resultIntent);

        // If snooze, reschedule for 10 minutes later
        if ("snooze".equals(action)) {
            // We need to get the original medication info to reschedule
            // For now, we'll just log - the JS side should handle rescheduling
            Log.d(TAG, "Snooze action - JS should reschedule");
        }
    }

    private void handleBootCompleted(Context context) {
        Log.d(TAG, "Boot completed - enhanced reminders should be rescheduled by JS");
        // The JS side (App.tsx) will call syncLocalNotifications on startup
        // which will reschedule all enhanced reminders
    }

    private PendingIntent createActionIntent(Context context, int notificationId, String action, String doseKey) {
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

    private int getSmallIcon(Context context) {
        return context.getApplicationInfo().icon;
    }

    private int getIconRes(Context context, String name) {
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