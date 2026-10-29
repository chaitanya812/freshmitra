import {
  collection, doc, getDoc, getDocs, limit, orderBy, query, runTransaction,
  serverTimestamp, setDoc, where, writeBatch
} from "firebase/firestore";
import { db, ensureAnonymousSession, firebaseConfigured } from "./firebase";

export { firebaseConfigured };

function requireDatabase() {
  if (!firebaseConfigured || !db) throw new Error("Firebase is not configured.");
  return db;
}

async function requireUser() {
  const user = await ensureAnonymousSession();
  if (!user) throw new Error("Could not start a Firebase user session.");
  return user;
}

export async function fetchCatalog() {
  if (!firebaseConfigured || !db) return { products: [], groups: [] };
  const [products, groups] = await Promise.all([
    getDocs(query(collection(db, "products"), limit(100))),
    getDocs(query(collection(db, "groupBuys"), where("status", "==", "Collecting"), limit(100))),
  ]);
  return {
    products: products.docs.map(item => ({ id: item.id, ...item.data() })),
    groups: groups.docs.map(item => {
      const data = item.data();
      return {
        id: item.id,
        name: data.productName || "Fresh product",
        description: data.description || "Fresh from a local vendor",
        category: data.category || "Daily Essentials",
        unit: data.unit || "kg",
        retailPrice: Number(data.retailPrice || 0),
        groupPrice: Number(data.groupPrice || 0),
        joinedQuantity: Number(data.joinedQuantity || 0),
        targetQuantity: Math.max(1, Number(data.targetQuantity || 1)),
        hoursLeft: Number(data.hoursLeft || 4),
        minutesLeft: Number(data.minutesLeft || 0),
        imageEmoji: data.imageEmoji || "🧺",
        color: data.color,
        dealerName: data.dealerName || "Freshmitra Community",
        dealerRating: data.dealerRating || "New",
        closingTimeLabel: data.closingTimeLabel || "",
      };
    }),
  };
}

export async function fetchUserData(userId) {
  const database = requireDatabase();
  const [userSnapshot, ordersSnapshot] = await Promise.all([
    getDoc(doc(database, "users", userId)),
    getDocs(query(
      collection(database, "users", userId, "orders"),
      orderBy("createdAt", "desc"),
      limit(100)
    )),
  ]);
  const userData = userSnapshot.exists() ? userSnapshot.data() : {};
  return {
    profile: userData.displayName && userData.email
      ? { name: userData.displayName, email: userData.email }
      : null,
    location: userData.location || "Kukatpally, Hyderabad",
    wishes: Array.isArray(userData.savedDealIds) ? userData.savedDealIds : [],
    orders: ordersSnapshot.docs.map(item => ({ id: item.id, ...item.data() })),
  };
}

export async function saveUserProfile(userId, { name, email }) {
  const database = requireDatabase();
  await setDoc(doc(database, "users", userId), {
    displayName: name,
    email,
    isAnonymous: false,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveUserPreferences(userId, { location, wishes }) {
  const database = requireDatabase();
  await setDoc(doc(database, "users", userId), {
    location,
    savedDealIds: wishes,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

function makeOrder({ deal, qty, slot, status = "Collecting", type, area }) {
  return {
    deal,
    qty: Number(qty),
    slot,
    status,
    type,
    ...(area ? { area } : {}),
    mode: "firebase",
    createdAt: serverTimestamp(),
  };
}

export async function createGroupRecord({ product, qty, closing, area, deal }) {
  if (!firebaseConfigured || !db) return { mode: "demo" };
  const database = requireDatabase();
  const user = await requireUser();
  const groupRef = doc(collection(database, "groupBuys"));
  const orderRef = doc(collection(database, "users", user.uid, "orders"));
  const group = {
    productName: product,
    targetQuantity: Number(qty),
    unit: deal?.unit || "kg",
    closingTimeLabel: closing,
    deliveryArea: area,
    category: deal?.category || "Vegetables",
    groupPrice: Number(deal?.group || 0),
    retailPrice: Number(deal?.retail || 0),
    imageEmoji: deal?.image || "🧺",
    color: deal?.color || "#E8F5E9",
    dealerName: deal?.dealer || "Freshmitra Community",
    dealerRating: deal?.rating || "New",
    joinedQuantity: 0,
    status: "Collecting",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  };
  const order = makeOrder({
    deal: { ...deal, id: groupRef.id, target: Number(qty) },
    qty,
    slot: `Closes in ${closing}`,
    type: "created",
    area,
  });
  const batch = writeBatch(database);
  batch.set(groupRef, group);
  batch.set(orderRef, order);
  batch.set(doc(database, "users", user.uid), {
    updatedAt: serverTimestamp(),
    isAnonymous: user.isAnonymous,
  }, { merge: true });
  await batch.commit();
  return { mode: "firebase", id: groupRef.id, orderId: orderRef.id, userId: user.uid };
}

export async function joinGroupRecord({ groupId, deal, quantity, slot }) {
  if (!firebaseConfigured || !db) return { mode: "demo" };
  const database = requireDatabase();
  const user = await requireUser();
  const membershipRef = doc(collection(database, "groupMemberships"));
  const orderRef = doc(collection(database, "users", user.uid, "orders"));
  const groupRef = doc(database, "groupBuys", String(groupId));
  const order = makeOrder({ deal, qty: quantity, slot, type: "group" });

  await runTransaction(database, async transaction => {
    const groupSnapshot = await transaction.get(groupRef);
    if (groupSnapshot.exists()) {
      const group = groupSnapshot.data();
      const joined = Number(group.joinedQuantity || 0);
      const target = Number(group.targetQuantity || 0);
      if (group.status !== "Collecting" || joined + Number(quantity) > target) {
        throw new Error("This group no longer has enough quantity available.");
      }
      transaction.update(groupRef, { joinedQuantity: joined + Number(quantity) });
    }
    transaction.set(membershipRef, {
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
    transaction.set(orderRef, order);
    transaction.set(doc(database, "users", user.uid), {
      updatedAt: serverTimestamp(),
      isAnonymous: user.isAnonymous,
    }, { merge: true });
  });
  return { mode: "firebase", id: orderRef.id, membershipId: membershipRef.id, userId: user.uid };
}

export async function updateUserOrder(userId, orderId, updates) {
  const database = requireDatabase();
  await setDoc(doc(database, "users", userId, "orders", orderId), {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
