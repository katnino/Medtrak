package com.medtrak.app.enhancedreminders;

import android.content.Context;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Locale;

public class TtsHelper implements TextToSpeech.OnInitListener {

    private static final String TAG = "TtsHelper";
    private final Context context;
    private TextToSpeech tts;
    private boolean isInitialized = false;
    private String pendingText = null;
    private Locale pendingLocale = null;

    public TtsHelper(Context context) {
        this.context = context.getApplicationContext();
    }

    public void initialize() {
        if (tts != null) {
            return; // Already initialized
        }
        tts = new TextToSpeech(context, this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true;
            Log.d(TAG, "TTS initialized successfully");
            // Speak pending text if any
            if (pendingText != null) {
                speakInternal(pendingText, pendingLocale);
                pendingText = null;
                pendingLocale = null;
            }
        } else {
            Log.e(TAG, "TTS initialization failed: " + status);
            isInitialized = false;
        }
    }

    public void speak(String text, String languageTag) {
        if (!isInitialized) {
            // Queue for when initialized
            pendingText = text;
            pendingLocale = parseLocale(languageTag);
            return;
        }
        speakInternal(text, parseLocale(languageTag));
    }

    private void speakInternal(String text, Locale locale) {
        if (tts == null) return;
        
        // Set language
        int result = tts.setLanguage(locale);
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.w(TAG, "Language not supported: " + locale + ", falling back to default");
            tts.setLanguage(Locale.getDefault());
        }

        // Speak with high priority
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "medtrak-tts");
        } else {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
        }
    }

    public void stop() {
        if (tts != null) {
            tts.stop();
        }
    }

    public void shutdown() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
            isInitialized = false;
        }
    }

    private Locale parseLocale(String languageTag) {
        try {
            // Parse language tag like "en-US", "sr-Latn-RS", "sr-Latn"
            String[] parts = languageTag.split("-");
            if (parts.length >= 2) {
                String language = parts[0];
                String country = parts[1];
                if (parts.length >= 3) {
                    // Handle variants like "sr-Latn-RS"
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
}