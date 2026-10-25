# Freshmitra Firebase setup

## 1. Create or choose a Firebase project
Open https://console.firebase.google.com/ and create a project named `Freshmitra` (or choose your existing project).

## 2. Register a Web app
In Project settings → General → Your apps → Add app → Web. Copy the Firebase web configuration values into a new `.env.local` file at the project root. Start from `.env.example`.

The web configuration values are used by the browser SDK. Do not put a service-account JSON file or Admin SDK private key in this frontend project.

## 3. Enable Authentication
Open Build → Authentication → Get started → Sign-in method and enable **Anonymous** for this prototype. Later, add phone or email sign-in before launch.

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

Repeat for the other items. This project currently keeps its full demo catalogue in `src/App.jsx`; the service layer can read Firestore products once configured.

## 6. Restart Vite
After creating `.env.local`, stop the dev server and run `npm run dev` again.

## Important security notes
- `.env.local` must never be committed to Git. The `VITE_` prefix means these values are bundled into the client; Firebase web config is not a server secret, and Firestore rules are the actual access control.
- Anonymous accounts are suitable for prototyping, not as a full customer identity system.
- This first integration scaffold stores group listings and membership records. It does not process payments, reserve inventory atomically, verify vendor identities, or guarantee the final wholesale price.
- Before a public launch, add trusted server-side validation (Cloud Functions or another backend), rate limiting/abuse prevention, admin roles, vendor verification, order cancellation/refund handling, and a tested privacy policy.
- A composite index may be required for membership queries. If Firebase provides an index-creation link in an error, follow it in the Firebase Console.
