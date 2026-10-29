# Freshmitra Firebase setup

## 1. Create or choose a Firebase project
Open https://console.firebase.google.com/ and create a project named `Freshmitra` (or choose your existing project).

## 2. Register a Web app
In Project settings → General → Your apps → Add app → Web. Copy the Firebase web configuration values into `.env.local` at the project root using the `VITE_FIREBASE_*` names from `.env.example`. The measurement ID is optional. Restart Vite after changing environment values.

The web configuration values are used by the browser SDK. Do not put a service-account JSON file or Admin SDK private key in this frontend project.

## 3. Enable Authentication
Open Build → Authentication → Get started → Sign-in method and enable **Anonymous** and **Email/Password**. Anonymous sign-in supports guest browsing and group participation; email/password sign-in creates a persistent customer account.

## 4. Create Firestore
Open Build → Firestore Database → Create database. Start in production mode, choose a region close to your first customers (for example, an available India region), and publish the rules in `firestore.rules` using the Firebase Console Rules tab or Firebase CLI.

Do not enable open read/write rules for testing.

## 5. Add sample products
In Firestore, create a `products` collection. Add documents with fields such as:
- `name` (string), e.g. `Fresh Tomato`
- `category` (string), e.g. `Vegetables`
- `unit` (string), e.g. `kg`
- `retailPrice` (number), e.g. `38`
- `groupPrice` (number), e.g. `25`
- `imageEmoji` (string), e.g. `🍅`
- `active` (boolean), `true`

Repeat for the other items. The app reads active documents from `products` and open groups from `groupBuys`. When no catalogue documents exist, it uses the local sample catalogue.

User profile data is stored in `users/{uid}`. Saved deal IDs and delivery area are stored on that document; order history is stored under `users/{uid}/orders`. Group creation writes to `groupBuys`, and joining a group writes to `groupMemberships` and updates the open group's joined quantity in a Firestore transaction.

## 6. Restart Vite
After creating `.env.local`, stop the dev server and run `npm run dev` again.

## Important security notes
- `.env.local` must never be committed to Git. The `VITE_` prefix means these values are bundled into the client; Firebase web config is not a server secret, and Firestore rules are the actual access control.
- Restrict the web API key to the app's website referrers and the Firebase APIs the app uses in Google Cloud Console. Do not treat key restrictions as a replacement for Firestore Security Rules.
- Analytics initializes only when a measurement ID is configured and the browser supports it. Add appropriate privacy disclosures and consent controls before a public launch.
- Anonymous accounts are suitable for prototyping, not as a full customer identity system.
- This integration does not process payments, reserve inventory atomically, verify vendor identities, or guarantee the final wholesale price.
- Before a public launch, add trusted server-side validation (Cloud Functions or another backend), rate limiting/abuse prevention, admin roles, vendor verification, order cancellation/refund handling, and a tested privacy policy.
- A composite index may be required for membership queries. If Firebase provides an index-creation link in an error, follow it in the Firebase Console.
