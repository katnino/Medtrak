import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medtrak.app',
  appName: 'Medtrak',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
    EnhancedReminders: {
      // Custom plugin for enhanced medication reminders with full-screen alarms and TTS
    },
  },
};

export default config;
