# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-10

### Fixed
- **DoseRing AM/PM overlap**: 08:00 and 20:00 no longer render on the same point. The dial remains a 12-hour clock; PM doses now sit on an inner ring (r=86) at the same clock positions as their AM counterparts on the outer ring (r=112).
- **Android reminders lost after reboot**: Enhanced reminders now persist their payloads natively via `ReminderStore` and are re-armed automatically on `BOOT_COMPLETED`. Stale past reminders are dropped; future ones are restored with original language and trigger time.
- **Missing `USE_FULL_SCREEN_INTENT` on Android 14+**: Permission declared in manifest; full-screen medication alarms now work on Android 14+ (user may still need to enable "Full-screen notifications" in system settings).
- **Dose marked "fired" before acknowledgment**: Startup now clears `firedAlarms` for today's still-pending doses, so a missed alarm prompts again on next launch. Flags for other days and past appointments are pruned.

### Changed
- **Enhanced reminders can be turned off**: Toggling the feature off now cancels all armed enhanced alarms and clears the persisted active marker, so they don't fire (or restore after reboot) alongside standard notifications.
- **Native snooze rescheduling**: Snooze actions now reschedule natively (10 min) via `EnhancedReminderNotificationHelper` so the alarm fires even if the JS bridge isn't listening.

### Added
- `ReminderStore` — native `SharedPreferences` persistence for enhanced reminder payloads (ID, dose key, medication name, dosage, time, trigger time, language).
- `EnhancedRemindersReceiver.handleBootCompleted()` — full reboot restore logic for enhanced reminders.
- `USE_FULL_SCREEN_INTENT` permission in `AndroidManifest.xml`.

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