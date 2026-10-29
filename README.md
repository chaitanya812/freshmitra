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

5. To connect the Firebase project, copy `.env.example` to `.env.local`, enter the Firebase web app values, and restart Vite. `.env.local` is ignored by Git.
6. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Deploy to Vercel

1. Put this project in a GitHub repository. Do not commit `.env.local`, Firebase service-account keys, or other credentials.
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy. `vercel.json` configures the Vite build, `dist` output, and single-page app fallback.
3. For demo mode, no environment variables are required. Orders and groups will be stored only in each visitor's browser.
4. To connect Firebase, add the six required `VITE_FIREBASE_*` browser configuration values from `.env.example` under **Project → Settings → Environment Variables** in Vercel, for the Production environment. Add `VITE_FIREBASE_MEASUREMENT_ID` if using Analytics. Redeploy after adding them. These web-app values are included in the browser bundle and are not server secrets; never put a service-account key in a `VITE_` variable.
5. In Firebase Authentication, enable **Anonymous** and **Email/Password** sign-in. Create Firestore, review and publish `firestore.rules`, then add product documents to `products`. Test the deployed app with real mobile browsers before sharing it.

Vercel hosts the web/PWA version; it does not by itself create App Store or Play Store releases. Firebase Auth and Firestore are connected for prototype accounts and order flows, but this is not a production-ready ordering, payment, or fulfilment backend.

## Prototype features
- Responsive Home / Discover screen with Firebase product and open-group catalogue, plus sample deals as an empty-catalogue fallback
- Branded launch splash screen and installable Progressive Web App shell
- Category filters and search
- Group detail sheet with quantity controls and delivery slot selection
- Firebase email/password account creation and sign-in; guest browsing uses anonymous Firebase Auth
- Per-account Firestore profile, delivery area, saved deals, created groups, memberships, and order history
- Join-group flow that records membership and updates collecting group quantity transactionally
- Create-group flow with target quantity, closing time, and delivery area
- My Groups / Orders with active and past order tabs
- Categories, Profile, and sign-in/sign-up screens
- Editable browser-only demo profile when Firebase is not configured
- Search across deal names, categories, descriptions, and vendors, plus a working Today's Deals filter
- Demo order completion flow to populate Past Orders
- Exactly four bottom navigation tabs: Home, Categories, My Groups, Profile
- Save-deal hearts, toast feedback, and location selector
- Without Firebase configuration, demo orders, saved deals, profile, and delivery area persist in the browser
- Offline app shell for returning visitors; live data still requires a network connection
- Sample data is local/demo data when no catalogue is present in Firestore; Firebase configuration is optional for local demo use

## Current limitations
- Product imagery uses emoji illustrations as lightweight placeholders.
- Without Firebase configuration, orders and groups are saved only in that browser and are not shared across devices.
- Without Firebase configuration, sign-in/sign-up is a local UI demo. With Firebase configured, email/password authentication and user data use Firebase Auth and Firestore.
- Firebase-backed ordering is still a prototype: payments, refunds, verified vendor operations, server-authoritative pricing/inventory, cancellations, and live delivery tracking need production services.
- Firebase Analytics initializes only when a Measurement ID is configured and the browser supports it. Add appropriate privacy disclosures and consent controls before public launch.
- Restrict the Firebase web API key to this app's deployed domains and only the APIs it needs in Google Cloud Console. Firestore Security Rules—not the API key—must enforce access control.
- Do not collect real customer payment or personal data in this prototype.

## Mobile installation and store release

The web app includes a PWA manifest, app icon, install prompt where supported, and a service worker for an offline app shell. On iOS, visitors can install it from Safari using **Share → Add to Home Screen**. This does not publish a native app to the Apple App Store or Google Play.

Before a public launch, complete production authentication and privacy/consent flows, backend-authoritative prices and group membership, vendor and fulfilment operations, payment/refund integration, monitoring, and security/rules review. Store distribution additionally needs native iOS/Android packaging (for example, a Capacitor wrapper), platform-specific icon/screenshot assets, developer accounts, signing credentials, and store-policy review. None of these credentials or live services are present in this demo.

## Suggested next steps
1. Test the UI and flows locally.
2. Replace placeholder product art with optimized product images.
3. Add product catalogue documents and verify the deployed Firestore rules against the real project.
4. Add vendor/admin workflows and backend-authoritative fulfilment controls.
5. Integrate a payment provider only after the order lifecycle and refund policy are defined.


## Firebase integration

Firebase integration helpers are now included in `src/lib/`:
- `firebase.js` initializes Firebase Auth, Firestore, and optional Analytics only when environment variables are configured.
- Firebase web configuration belongs in the ignored `.env.local` file for local development; it must not be copied into source files.
- `dataService.js` reads products and open groups, persists per-user profiles/preferences/orders, and creates groups and memberships.
- `.env.example` lists the browser config variables.
- `firestore.rules` allows public catalogue reads, limits writes to authenticated users, and protects user records.
- `scripts/FIREBASE_SETUP.md` explains how to configure the Firebase Console.

### Enable it
1. Follow `scripts/FIREBASE_SETUP.md`.
2. Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration.
3. Enable Anonymous and Email/Password sign-in, and create the Firestore database.
4. Publish `firestore.rules`.
5. Restart `npm run dev`.

Without `.env.local`, the app stays in demo mode and remains usable.
