**[English](README.md) | [Srpski](README.sr.md)**

# Medtrak

A dark, elegant, bilingual medication & appointment tracker: manage medications, see them
laid out on a calendar, and get on-screen + browser-notification alarms when
a dose is due. English and Serbian latin.
Everything is stored locally in the browser (`localStorage`) —
no backend, no account, no database required. You can set it up as a web app
or you can download android application APK from releases.

## Features

- **Medications** — name, dosage, form, one or more reminder times per day,
  specific days of the week (or every day), start/end dates, notes.
- **Today** — a circular "meridian" dial showing today's doses positioned by
  time of day, plus a simple take / skip list.
- **Doctor appointments** — title, doctor/clinic, location, date, time, and
  notes. Shown on the calendar (as a dot on the day) and in a dedicated
  section on Today when one falls today.
- **Calendar** — month view with a small adherence indicator and appointment
  dot per day, and a detail list for whichever day you select.
- **Alarms** — when a dose or appointment becomes due, a full-screen alarm
  appears with a soft chime (generated in-browser, no audio file needed) and,
  if you've granted permission, a native browser notification too.
- **Dark, low-contrast UI** — deliberately muted palette (no bright/saturated
  accent colors), a serif display face for headings, monospace for times and
  dosages.

## Running locally

```
npm install
npm run dev
```

## Building

```
npm run build
```

Outputs a fully static site to `dist/`.

## Deploying

This is a static single-page app (Vite + React), so it deploys the same way
almost anywhere.

### Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket), or run
   `vercel` from inside this folder with the [Vercel CLI](https://vercel.com/docs/cli).
2. Framework preset: **Vite**. Build command: `npm run build`. Output
   directory: `dist`. Vercel auto-detects all of this — no config file needed.

### Cloudflare Pages

1. Push to a Git repo and connect it in the Cloudflare dashboard, or deploy
   directly with Wrangler:

```
npm run build
npx wrangler pages deploy dist
```

2. Build command: `npm run build`. Build output directory: `dist`.

### Any other static host (Netlify, GitHub Pages, S3, etc.)

Run `npm run build` and upload the contents of `dist/`. It's a plain static
site — no server-side code, no environment variables required.

## Notes on reminders

Browser notification permission is requested on first load — grant it if you
want native OS notifications in addition to the in-app alarm. Like any
browser-based app, reminders only fire while a tab is open (in foreground or
background); this is a browser platform limitation, not something a static
site can work around without a push-notification backend. For anything
safety-critical, treat this as a helpful nudge alongside — not a replacement
for — a pillbox or a dedicated medical device.

## Offline native reminders

Medtrak can also be packaged as an iOS or Android app using Capacitor. Native
builds schedule reminders directly on the device, so they do not need an
account, backend, or internet connection. The web build remains completely
static and uses its existing in-tab alarms.

```
# Once per platform
npx cap add ios
npx cap add android

# Build the web app, copy it into the native projects, and open the IDE
npm run cap:ios
npm run cap:android
```

Grant notification permission when the app opens. On Android 12+, enable the
system's "Alarms & reminders" permission for exact scheduling. The Android
manifest does not request Internet access. The native app keeps up to 60
upcoming reminders scheduled at once (an iOS platform limit leaves room below
its maximum of 64); opening the app refreshes that rolling 30-day window after
changes or over time.

## Licence

Medtrak is released under the MIT licence.
