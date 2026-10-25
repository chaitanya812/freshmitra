# Freshmitra

**Buy Together. Save More.** — a mobile-first Indian group-buying grocery app prototype.

## Requirements
- Node.js 18+ (Node.js 20 LTS recommended)
- VS Code

## Run locally
1. Extract the `Freshmitra.zip` file.
2. Open the extracted `Freshmitra` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Deploy to Vercel

1. Put this project in a GitHub repository. Do not commit `.env.local`, Firebase service-account keys, or other credentials.
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy. `vercel.json` configures the Vite build, `dist` output, and single-page app fallback.
3. For demo mode, no environment variables are required. Orders and groups will be stored only in each visitor's browser.
4. To connect Firebase, add the six `VITE_FIREBASE_*` browser configuration values from `.env.example` under **Project → Settings → Environment Variables** in Vercel, for the Production environment. Redeploy after adding them. These are Firebase web-app configuration values, not Admin SDK credentials; never put a service-account key in a `VITE_` variable.
5. Enable the required Firebase Authentication provider and Firestore, then deploy and review `firestore.rules` from the Firebase project. Test the deployed app with real mobile browsers before sharing it.

Vercel hosts the web/PWA version; it does not by itself create App Store or Play Store releases. The Firebase scaffold is not yet a production-ready ordering, payment, fulfilment, or customer-account backend.

## Prototype features
- Responsive Home / Discover screen with sample group deals
- Branded launch splash screen and installable Progressive Web App shell
- Category filters and search
- Group detail sheet with quantity controls and delivery slot selection
- Join-group flow and demo order state
- Create-group flow with target quantity, closing time, and delivery area
- My Groups / Orders with active and past order tabs
- Categories and Profile screens
- Exactly four bottom navigation tabs: Home, Categories, My Groups, Profile
- Save-deal hearts, toast feedback, and location selector
- Demo orders, saved deals, and delivery area persist in the browser
- Offline app shell for returning visitors; live data still requires a network connection
- Sample data is local/demo data; no Firebase billing or API keys required

## Current limitations
- Product imagery uses emoji illustrations as lightweight placeholders.
- Without Firebase configuration, orders and groups are saved only in that browser and are not shared across devices.
- Firebase support currently uses anonymous authentication; customer accounts, verified vendor operations, inventory/pricing controls, payments, refunds, and live delivery tracking still need production services.
- Do not collect real customer payment or personal data in this prototype.

## Mobile installation and store release

The web app includes a PWA manifest, app icon, install prompt where supported, and a service worker for an offline app shell. On iOS, visitors can install it from Safari using **Share → Add to Home Screen**. This does not publish a native app to the Apple App Store or Google Play.

Before a public launch, complete production authentication and privacy/consent flows, backend-authoritative prices and group membership, vendor and fulfilment operations, payment/refund integration, monitoring, and security/rules review. Store distribution additionally needs native iOS/Android packaging (for example, a Capacitor wrapper), platform-specific icon/screenshot assets, developer accounts, signing credentials, and store-policy review. None of these credentials or live services are present in this demo.

## Suggested next steps
1. Test the UI and flows locally.
2. Replace placeholder product art with optimized product images.
3. Define the Firestore schema and access rules.
4. Add authentication and vendor/admin workflows.
5. Integrate a payment provider only after the order lifecycle and refund policy are defined.


## Phase 2: Firebase backend scaffold

Firebase integration helpers are now included in `src/lib/`:
- `firebase.js` initializes Firebase only when environment variables are configured.
- `dataService.js` reads active product documents and can create group listings / membership records.
- `.env.example` lists the browser config variables.
- `firestore.rules` gives public read access to products and group listings while protecting user records.
- `scripts/FIREBASE_SETUP.md` explains how to configure the Firebase Console.

### Enable it
1. Follow `scripts/FIREBASE_SETUP.md`.
2. Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration.
3. Enable Anonymous sign-in and create the Firestore database.
4. Publish `firestore.rules`.
5. Restart `npm run dev`.

Without `.env.local`, the app stays in demo mode and remains usable.
