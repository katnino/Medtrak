package com.medtrak.app.enhancedreminders;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Durable, process-independent queue of medication actions (taken/skip/snooze)
 * performed from a native notification or full-screen alarm while the app's web
 * view bridge was not listening (e.g. the app was backgrounded or killed).
 *
 * The live {@code enhancedReminderAction} event covers the foreground case; this
 * store covers the gap so the medication log stays in sync no matter when the
 * user tapped the action. Entries are drained (and cleared) once by the JS side
 * on app resume / cold start.
 */
final class ActionStore {
    private static final String TAG = "EnhancedActionStore";
    private static final String PREFS_NAME = "medtrak_enhanced_actions";
    private static final String KEY = "pending_actions";

    private ActionStore() {
    }

    static void persist(Context context, int notificationId, String action, String doseKey) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            JSONArray arr = new JSONArray(prefs.getString(KEY, "[]"));
            JSONObject entry = new JSONObject();
            entry.put("notificationId", notificationId);
            entry.put("action", action);
            entry.put("doseKey", doseKey);
            entry.put("ts", System.currentTimeMillis());
            arr.put(entry);
            prefs.edit().putString(KEY, arr.toString()).apply();
        } catch (JSONException e) {
            Log.e(TAG, "Failed to persist action", e);
        }
    }

    static JSONArray drain(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY, "[]");
        JSONArray out;
        try {
            out = new JSONArray(raw);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to parse pending actions, clearing", e);
            out = new JSONArray();
        }
        // Clear immediately so a second drain never reapplies the same action.
        prefs.edit().remove(KEY).apply();
        return out;
    }
}
