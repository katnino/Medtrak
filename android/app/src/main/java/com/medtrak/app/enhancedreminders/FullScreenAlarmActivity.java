package com.medtrak.app.enhancedreminders;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.medtrak.app.R;

import java.util.Locale;

public class FullScreenAlarmActivity extends Activity {

    private static final String TAG = "FullScreenAlarmActivity";
    private TextToSpeech tts;
    private String medicationName;
    private String dosage;
    private String time;
    private String doseKey;
    private int notificationId;
    private String languageTag;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Full-screen flags for lock screen display
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        // For Android 10+ (API 29+), use setTurnScreenOn
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setTurnScreenOn(true);
            setShowWhenLocked(true);
        }

        setContentView(R.layout.activity_fullscreen_alarm);

        // Get extras from intent
        Intent intent = getIntent();
        notificationId = intent.getIntExtra("notification_id", -1);
        doseKey = intent.getStringExtra("dose_key");
        medicationName = intent.getStringExtra("medication_name");
        dosage = intent.getStringExtra("dosage");
        time = intent.getStringExtra("time");
        languageTag = intent.getStringExtra("language");

        // Initialize TTS and speak immediately
        initializeAndSpeak();

        // Set up UI
        setupUI();
    }

    private void initializeAndSpeak() {
        String text = "Time to take " + medicationName + ", " + dosage;
        
        // Create TTS with synchronous initialization check
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                Log.d(TAG, "TTS initialized successfully");
                speakNow(text);
            } else {
                Log.e(TAG, "TTS initialization failed: " + status);
                // Try fallback with default locale
                speakNow(text);
            }
        });
    }

    private void speakNow(String text) {
        if (tts == null) return;

        Locale locale = parseLocale(languageTag);
        int result = tts.setLanguage(locale);
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.w(TAG, "Language not supported: " + locale + ", falling back to default");
            locale = Locale.getDefault();
            tts.setLanguage(locale);
        }

        // Speak with high priority
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "medtrak-alarm-tts");
        } else {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
        }
    }

    private Locale parseLocale(String languageTag) {
        if (languageTag == null || languageTag.isEmpty()) {
            return Locale.getDefault();
        }
        try {
            String[] parts = languageTag.split("-");
            if (parts.length >= 2) {
                String language = parts[0];
                String country = parts[1];
                if (parts.length >= 3) {
                    return new Locale(language, country, parts[2]);
                }
                return new Locale(language, country);
            }
            return new Locale(languageTag);
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse locale: " + languageTag, e);
            return Locale.getDefault();
        }
    }

    private void setupUI() {
        TextView medicationText = findViewById(R.id.medicationName);
        TextView dosageText = findViewById(R.id.dosageText);
        TextView timeText = findViewById(R.id.timeText);
        Button btnTaken = findViewById(R.id.btnTaken);
        Button btnSkip = findViewById(R.id.btnSkip);
        Button btnSnooze = findViewById(R.id.btnSnooze);

        medicationText.setText(medicationName);
        dosageText.setText(dosage);
        timeText.setText("Scheduled for " + time);

        btnTaken.setOnClickListener(v -> handleAction("taken"));
        btnSkip.setOnClickListener(v -> handleAction("skip"));
        btnSnooze.setOnClickListener(v -> handleAction("snooze"));
    }

    private void handleAction(String action) {
        // Stop TTS
        if (tts != null) {
            tts.stop();
        }

        // Send result back via broadcast to be handled by JS
        Intent resultIntent = new Intent("com.medtrak.app.ENHANCED_REMINDER_RESULT");
        resultIntent.putExtra("notification_id", notificationId);
        resultIntent.putExtra("action", action);
        resultIntent.putExtra("dose_key", doseKey);
        sendBroadcast(resultIntent);

        // If snooze, reschedule for 10 minutes later
        if ("snooze".equals(action)) {
            // This will be handled by the receiver which will reschedule
        }

        finish();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        super.onDestroy();
    }
}