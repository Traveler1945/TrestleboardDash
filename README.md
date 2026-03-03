# Trestleboard Revenue Ops Dashboard

Autonomous pipeline console for Trestleboard Group — a single-page app that runs locally (no backend) and persists state in `localStorage`. The 2.1 refactor introduced autonomy-mode controls, agent & conflict management, simulation tooling, and hard-constraint enforcement for federal work.

## Quick Start

1. Open `index.html` in any Chromium-based browser.
2. Enter the access phrase on the lock screen. The default is still **Mufasa1945** (salted + hashed client-side), but change it in `data.js` before shipping.
3. Once authenticated, all state is loaded from `localStorage`. Clearing site data resets the dashboard.

## Project Structure

| File | Purpose |
| --- | --- |
| `index.html` | UI markup, styles, and primary application logic. |
| `data.js` | Centralized config: storage keys, stage metadata, NBA defaults, constraints, agent definitions, auth policy, and scenario presets. |
| `README.md` | This file. |

## Recent Work

- **Modular config** — moved all stage/constraint/agent constants + auth policy into `data.js` so they can be versioned and imported elsewhere.
- **Auth hardening** — the gate now hashes the salted passphrase with WebCrypto, enforces a 5-attempt limit, and locks for 15 minutes on repeated failures. Legacy fallback remains for air-gapped browsers.
- **UI/UX polish** — autonomy controls, agent/conflict section, simulation engine, constraint panels, NBA stack, psychological profiles, manual hold lockouts, and the strategic brief modal.

## Auth Configuration

Edit `AUTH` inside `data.js`:

```js
AUTH: {
  passHash: '<sha256 of salt:pass>',
  salt: 'trestleboard-v21',
  legacyPass: '...', // optional fallback if WebCrypto is unavailable
  maxAttempts: 5,
  lockMinutes: 15
}
```

To rotate credentials:

1. Pick a new passphrase.
2. Run `node -e "const crypto=require('crypto'); const s='salt:newpass'; console.log(crypto.createHash('sha256').update(s).digest('hex'))"`.
3. Update `passHash` (and optionally `legacyPass`).

## Roadmap

- Extract logic into smaller modules (`state.js`, `ui.js`, etc.) for easier testing.
- Wire a lightweight persistence adapter (e.g., Supabase) so multiple operators can share the same board.
- Add automated data export/import for audit snapshots.
- Ship a production build script that lints, minifies, and versions the static assets.
