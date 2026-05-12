# Installing Tunet Dashboard — Native & PWA Guide

Tunet Dashboard ships as a **web app** and can be run in several ways depending on your device.

---

## 1. Docker (recommended for self-hosting)

The easiest way to run Tunet on any Linux/macOS/Windows server or NAS.

```bash
docker compose up -d
```

Access the dashboard at `http://localhost:8080` (or the port you configured).

---

## 2. Progressive Web App (PWA)

Install directly from any modern browser — no app store required.

### iOS / iPadOS
1. Open Tunet in **Safari** (not Chrome — Apple requires Safari for PWA install).
2. Tap the **Share** button → **Add to Home Screen**.
3. Name it "Tunet" and tap **Add**.
4. The app opens in standalone mode with no browser chrome.

> **Tip:** On iPadOS you can use the app in Split View alongside Home Assistant.

### Android
1. Open Tunet in **Chrome** or **Edge**.
2. Tap the browser menu → **Add to Home screen** (or the install banner).
3. Tap **Install**.

### macOS / Windows / Linux (Chrome / Edge)
1. Open Tunet in **Chrome** or **Edge**.
2. Click the **install icon** (⊕) in the address bar, or go to Menu → **Install Tunet Dashboard**.
3. The app opens as a separate window without browser chrome.

---

## 3. Capacitor — Native iOS / iPadOS app

Use [Capacitor](https://capacitorjs.com/) to wrap the web app in a native iOS container.

### Requirements
- macOS with Xcode 15+
- Node.js 18+
- Capacitor CLI: `npm install -g @capacitor/cli`

### Steps

```bash
# Install Capacitor iOS platform
npm install @capacitor/core @capacitor/ios
npx cap add ios

# Build the web app
npm run build

# Sync built files into the native project
npx cap sync ios

# Open Xcode
npx cap open ios
```

In Xcode: select your target device or simulator, then press **Run** (▶).

The `capacitor.config.json` at the project root configures app ID, name, and iOS-specific options.

---

## 4. Tauri — Desktop app (macOS / Linux)

Use [Tauri](https://tauri.app/) for a lightweight native desktop wrapper.

### Requirements
- Rust toolchain: [rustup.rs](https://rustup.rs)
- System dependencies (Linux): `libwebkit2gtk-4.0-dev`, `libgtk-3-dev`, etc.
  See [Tauri prerequisites](https://tauri.app/start/prerequisites/).

### Steps

```bash
# Install Tauri CLI
cargo install tauri-cli

# Development mode (hot reload)
cargo tauri dev

# Build distributable binary
cargo tauri build
```

The resulting binary is found in `src-tauri/target/release/bundle/`.

The Tauri config lives in `src-tauri/tauri.conf.json`.

---

## 5. Kiosk Mode (touchscreen displays)

### Android tablet
1. Install the PWA via Chrome (section 2 above).
2. Use a kiosk launcher app (e.g. **Fully Kiosk Browser**) pointing to your Tunet URL.
3. Enable kiosk mode in Tunet Settings → Layout → **Cards Only Mode** to hide navigation.

### Linux kiosk (Raspberry Pi, Intel NUC, etc.)
```bash
# Chromium in kiosk mode
chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --start-fullscreen http://localhost:8080
```

Add to `/etc/xdg/autostart/tunet-kiosk.desktop` for auto-start on login.

---

## 6. Apple TV / tvOS (future milestone)

tvOS requires a separate thin-client UI (focus-based navigation). This is planned as a separate milestone and is not yet supported.

---

## Summary

| Platform | Method | Status |
|---|---|---|
| Linux / macOS / Windows server | Docker | ✅ Supported |
| Any modern browser | PWA install | ✅ Supported |
| iOS / iPadOS | PWA (Safari) | ✅ Supported |
| iOS / iPadOS native | Capacitor | ✅ Config ready |
| macOS / Linux desktop | Tauri | ✅ Config ready |
| Android | PWA (Chrome) | ✅ Supported |
| tvOS / Apple TV | Separate client | 🗓 Planned |
