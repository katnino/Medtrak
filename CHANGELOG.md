# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-27

### Added
- Initial release of Medtrak medication & appointment tracker
- Medication tracking with dosage, form, reminder times, and scheduling
- Today view with circular meridian dial showing doses by time of day
- Calendar view with month display and adherence indicators
- Doctor appointment tracking with reminders
- Full-screen alarm overlays with chime and TTS (text-to-speech) for medication reminders
- Browser notifications support (web)
- Native Android enhanced reminders with exact alarms and full-screen intents
- Offline-first architecture - all data stored locally in localStorage
- Dark, low-contrast UI with serif display face and monospace typography
- Multi-language support (English, Serbian Latin)
- No account required, no backend, no cloud sync

### Privacy
- No analytics, no tracking, no telemetry
- No network permissions on Android
- No external font loading (fonts bundled locally)
- All data stays on device

## [Unreleased]

### Planned
- iOS native reminders support
- Data export/import functionality
- Additional language translations
- Widget support