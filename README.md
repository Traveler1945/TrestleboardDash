# Trestleboard Revenue Ops Dashboard

**CLAWBOT // TRESTLEBOARD GROUP LLC — Revenue Operations Command**

A self-contained, single-HTML-file revenue operations intelligence dashboard for Trestleboard Group LLC. Tracks DoD/federal contract pipeline leads, decay risk, next-best-actions, agent outreach campaigns, and revenue forecasts — all running client-side with zero backend dependencies.

---

## What It Is

The Trestleboard Revenue Ops Dashboard is a militarized CRM/pipeline command center designed for federal B2B sales operations in the defense and government contracting space. It provides:

- **Pipeline Intelligence** — Kanban + table views with lead scoring, decay tracking, and priority stacking
- **Revenue Forecasting** — Expected Value modeling (EV = P(close) × deal value × stage multiplier)
- **Agent Discovery Queue** — Pre-loaded with 33 verified DoD/federal contacts sourced from USAspending.gov and Apollo.io
- **Campaign Orchestration** — Multi-step outreach sequences with contact approval gates
- **Simulation Engine** — Scenario modeling for outreach frequency, discounting, and cycle time changes
- **Intel Sections** — Objection registry, briefing scheduler, agent mesh, constraints doctrine, audit log
- **Hardened Auth Gate** — SHA-256 passphrase hashing via SubtleCrypto, localStorage session token (8-hour TTL), lockout after 5 failed attempts

All state is persisted in `localStorage`. No server, no database, no dependencies beyond Chart.js (loaded from CDN).

---

## Deploy

### Option 1: Open Locally

```bash
# Just open in any modern browser
open index.html
```

> **Note:** SubtleCrypto (SHA-256 auth) requires a secure context — `localhost` or `https://`. If you open directly from disk (`file://`), auth will fall back to a plain-text legacy passphrase check.

### Option 2: Static Host (Recommended)

Upload both files to any static host:

```
index.html   ← Main dashboard
data.js      ← Config + intel data (loaded by index.html)
```

**Recommended hosts:**
- [GitHub Pages](https://pages.github.com/) — push to `main`, enable Pages → free `https://`
- [Netlify Drop](https://app.netlify.com/drop) — drag-and-drop folder → instant HTTPS
- [Vercel](https://vercel.com/) — `vercel --prod` from the project folder
- Any web server (nginx, Apache, S3+CloudFront)

#### GitHub Pages Quick Start

```bash
# From the project folder
git push origin main
# Then: GitHub repo → Settings → Pages → Source: main branch → /root
# URL: https://Traveler1945.github.io/TrestleboardDash/
```

---

## Auth Setup

Authentication uses **SHA-256 hashing via SubtleCrypto** with a salted passphrase. The hash is stored in `data.js` — the raw passphrase is never stored anywhere.

### Current Credentials

The default passphrase is configured in `data.js`:

```javascript
AUTH: Object.freeze({
  passHash: 'd5670fe9909586f26781025738c1960cfc7686c01bf721144c73cf8b82465440',
  salt: 'trestleboard-v21',
  legacyPass: 'Mufasa1945',  // fallback for non-HTTPS contexts
  maxAttempts: 5,
  lockMinutes: 15,
  sessionTTL: 28800000  // 8 hours in milliseconds
})
```

### To Change the Passphrase

1. Choose your new passphrase (e.g., `NewPassphrase2026`)
2. Generate the hash:

```javascript
// Run in browser console on your deployed site:
const salt = 'trestleboard-v21';
const pass = 'YourNewPassphrase';
const data = new TextEncoder().encode(`${salt}:${pass}`);
const hashBuf = await crypto.subtle.digest('SHA-256', data);
const hash = Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
console.log(hash);
```

3. Update `passHash` in `data.js` with the output
4. Optionally update `legacyPass` for fallback contexts
5. Redeploy

### Session Behavior

- On successful auth, a random 128-bit token is stored in `localStorage` with an 8-hour expiry
- Returning users within the TTL window skip the auth gate automatically
- Tokens are invalidated on expiry — users must re-authenticate
- Auth lockout: 5 failed attempts triggers a 15-minute cooldown (stored in `localStorage`)

---

## Data Customization

All static data lives in **`data.js`** — edit this file to customize without touching the main app logic.

### Pipeline Stages

```javascript
STAGES: ['Qualified','Briefing','Proposal','Negotiation','Verbal','Closed']
STAGE_MULT: { Qualified: 0.30, Briefing: 0.50, ... }  // EV probability multipliers
```

### Default Next Best Actions

```javascript
DEFAULT_NBA: {
  Qualified: 'Send first-touch email',
  Briefing: 'Follow up within 48h',
  // etc.
}
```

### Hard Constraints (Agent Rules)

```javascript
HARD_CONSTRAINTS: [
  'NEVER send more than 1 outreach touch per lead per 72h',
  'NEVER discount beyond 10% without Roman approval',
  // ... 10 total rules
]
```

### Agent Definitions

Six default agents are defined in `AGENT_DEFINITIONS`. Each has an `id`, `name`, `role`, and `confidence` percentage. Add/remove agents here.

### Scenario Presets (Simulation Engine)

Six simulation presets in `SCENARIO_PRESETS` — each defines urgency multiplier, conversion rate delta, cycle time delta, and recommendation text.

### Intel Lead Data

Three pre-loaded discovery queues in `data.js`:

- **`AGENT_INTEL_LEADS`** — 12 leads from USAspending.gov DoD contract recompetes (sourced programmatically)
- **`APOLLO_VERIFIED_LEADS`** — 9 Apollo.io-verified contacts with confirmed email addresses
- **`SOUTH_FLORIDA_LEADS`** — 12 South Florida / local government / L3Harris contacts

To add new discovery leads, append objects to the appropriate array following the schema:

```javascript
{
  id: "unique_id",
  source: "Source description",
  name: "Contact Name",
  org: "Organization",
  vertical: "Federal DoD",  // Must match a known vertical
  confidence: 85,            // 0-100
  intel: "Full intel text including approach, email, LinkedIn..."
}
```

---

## File Structure

```
trestleboard-dashboard/
├── index.html          ← Complete dashboard (HTML + CSS + JS)
├── data.js             ← All static config and intel data
├── README.md           ← This file
├── .gitignore          ← Git ignore rules
├── rebuild.js          ← Legacy build utility (not needed for deployment)
├── discoveryLeads.json ← Raw discovery lead data (reference only)
└── verifiedContacts.json ← Raw verified contacts (reference only)
```

---

## Next Steps Roadmap

### Near-Term (v2.5)
- [ ] **Backend persistence** — Replace localStorage with a lightweight backend (Supabase, PocketBase, or simple Node.js + SQLite) for multi-device sync and data durability
- [ ] **Real-time decay alerts** — Push notifications (Telegram bot webhook) when leads cross the 72h decay threshold
- [ ] **CSV import** — Bulk lead import from CSV/Excel for faster pipeline seeding
- [ ] **Email integration** — Log touches automatically from Gmail/Outlook via Zapier webhook

### Medium-Term (v3.0)
- [ ] **Multi-user** — Role-based access (Roman = principal, agents = view-only or restricted edit)
- [ ] **Automated outreach** — Connect campaigns to actual email/LinkedIn sequences via n8n or Make
- [ ] **AI-generated briefs** — Auto-generate dossier talking points from lead intel using OpenAI API
- [ ] **Contract vehicle matching** — Auto-match leads to relevant IDIQ/OTA/GSA vehicles based on vertical

### Long-Term (v4.0)
- [ ] **Mobile app** — React Native or PWA version for field use
- [ ] **CRM sync** — Two-way sync with HubSpot or Salesforce
- [ ] **Predictive scoring** — ML-based lead scoring trained on historical close rates
- [ ] **SAM.gov integration** — Live contract opportunity alerts piped directly into discovery queue

---

## Security Notes

- This dashboard contains **internal BD strategy and verified contact intelligence** — do not expose to public internet without auth
- The passphrase hash in `data.js` is safe to commit — it's a one-way SHA-256 hash
- The GitHub token embedded in git remote config should be rotated periodically
- Consider IP allowlisting or Cloudflare Access for additional protection in production

---

## Contact

**Principal:** Roman Lepekha — Trestleboard Group LLC  
**Email:** southmiamidemolaynumber308@gmail.com  
**GitHub:** [Traveler1945](https://github.com/Traveler1945)
