import {
  addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp,
  setDoc, where
} from "firebase/firestore";
import { db, ensureAnonymousSession, firebaseConfigured } from "./firebase";

export { firebaseConfigured };

export async function fetchProducts() {
  if (!firebaseConfigured || !db) return [];
  const snapshot = await getDocs(query(collection(db, "products"), limit(100)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

export async function createGroupRecord({ product, qty, closing, area, deal }) {
  if (!firebaseConfigured || !db) return { mode: "demo" };
  const user = await ensureAnonymousSession();
  if (!user) throw new Error("Could not start a user session.");
  const payload = {
    productName: product,
    targetQuantity: Number(qty),
    unit: deal?.unit || "kg",
    closingTimeLabel: closing,
    deliveryArea: area,
    category: deal?.category || "Vegetables",
    groupPrice: Number(deal?.group || 0),
    retailPrice: Number(deal?.retail || 0),
    imageEmoji: deal?.image || "🧺",
    joinedQuantity: 0,
    status: "Collecting",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "groupBuys"), payload);
  await setDoc(doc(db, "users", user.uid), {
    updatedAt: serverTimestamp(),
    isAnonymous: true,
  }, { merge: true });
  return { mode: "firebase", id: ref.id, userId: user.uid };
}

export async function joinGroupRecord({ groupId, deal, quantity, slot }) {
  if (!firebaseConfigured || !db) return { mode: "demo" };
  const user = await ensureAnonymousSession();
  if (!user) throw new Error("Could not start a user session.");
  const membership = await addDoc(collection(db, "groupMemberships"), {
    groupId: String(groupId),
    productName: deal.name,
    quantity: Number(quantity),
    unit: deal.unit || "kg",
    groupPrice: Number(deal.group),
    deliverySlot: slot,
    userId: user.uid,
    status: "Collecting",
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "users", user.uid), {
    updatedAt: serverTimestamp(),
    isAnonymous: true,
  }, { merge: true });
  return { mode: "firebase", id: membership.id, userId: user.uid };
}

export async function fetchMyMemberships() {
  if (!firebaseConfigured || !db) return [];
  const user = await ensureAnonymousSession();
  if (!user) return [];
  const q = query(
    collection(db, "groupMemberships"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}
