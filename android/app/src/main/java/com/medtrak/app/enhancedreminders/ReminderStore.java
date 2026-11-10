package com.medtrak.app.enhancedreminders;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Persists the payload of every scheduled enhanced reminder so pending alarms
 * can be restored after a device reboot.
 *
 * AlarmManager alarms do not survive a reboot, and the web view (which owns the
 * medication schedule) is not running when BOOT_COMPLETED arrives. Storing the
 * payload natively lets the receiver recreate the exact same alarm without JS.
 */
final class ReminderStore {
    private static final String TAG = "ReminderStore";
    private static final String PREFS_NAME = "medtrak_enhanced_reminders";

    private static final String KEY_ID = "id";
    private static final String KEY_DOSE = "key";
    private static final String KEY_NAME = "medicationName";
    private static final String KEY_DOSAGE = "dosage";
    private static final String KEY_TIME = "time";
    private static final String KEY_TRIGGER = "triggerAtMillis";
    private static final String KEY_LANGUAGE = "language";

    static final class Reminder {
        final int id;
        final String key;
        final String medicationName;
        final String dosage;
        final String time;
        final long triggerAtMillis;
        final String language;

        Reminder(
            int id,
            String key,
            String medicationName,
            String dosage,
            String time,
            long triggerAtMillis,
            String language
        ) {
            this.id = id;
            this.key = key;
            this.medicationName = medicationName;
            this.dosage = dosage;
            this.time = time;
            this.triggerAtMillis = triggerAtMillis;
            this.language = language;
        }
    }

    private ReminderStore() {
    }

    static void save(Context context, Reminder reminder) {
        try {
            JSONObject json = new JSONObject();
            json.put(KEY_ID, reminder.id);
            json.put(KEY_DOSE, reminder.key == null ? JSONObject.NULL : reminder.key);
            json.put(KEY_NAME, reminder.medicationName == null ? JSONObject.NULL : reminder.medicationName);
            json.put(KEY_DOSAGE, reminder.dosage == null ? JSONObject.NULL : reminder.dosage);
            json.put(KEY_TIME, reminder.time == null ? JSONObject.NULL : reminder.time);
            json.put(KEY_TRIGGER, reminder.triggerAtMillis);
            json.put(KEY_LANGUAGE, reminder.language == null ? JSONObject.NULL : reminder.language);

            prefs(context)
                .edit()
                .putString(String.valueOf(reminder.id), json.toString())
                .apply();
        } catch (JSONException e) {
            Log.e(TAG, "Failed to persist reminder id=" + reminder.id, e);
        }
    }

    static void remove(Context context, int id) {
        prefs(context).edit().remove(String.valueOf(id)).apply();
    }

    static void clear(Context context) {
        prefs(context).edit().clear().apply();
    }

    static List<Reminder> getAll(Context context) {
        List<Reminder> reminders = new ArrayList<>();

        for (Map.Entry<String, ?> entry : prefs(context).getAll().entrySet()) {
            if (!(entry.getValue() instanceof String)) continue;

            try {
                JSONObject json = new JSONObject((String) entry.getValue());
                reminders.add(new Reminder(
                    json.getInt(KEY_ID),
                    optNullableString(json, KEY_DOSE),
                    optNullableString(json, KEY_NAME),
                    optNullableString(json, KEY_DOSAGE),
                    optNullableString(json, KEY_TIME),
                    json.getLong(KEY_TRIGGER),
                    optNullableString(json, KEY_LANGUAGE)
                ));
            } catch (JSONException e) {
                Log.w(TAG, "Dropping malformed reminder " + entry.getKey(), e);
                prefs(context).edit().remove(entry.getKey()).apply();
            }
        }

        return reminders;
    }

    private static String optNullableString(JSONObject json, String key) {
        if (json.isNull(key)) return null;
        return json.optString(key, null);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
