import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  runTransaction,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlqoenjBwViZ0AcMkF_3G3SzUr3j-l28I",
  authDomain: "security-3a07e.firebaseapp.com",
  projectId: "security-3a07e",
  storageBucket: "security-3a07e.firebasestorage.app",
  messagingSenderId: "350554807786",
  appId: "1:350554807786:web:5e420a5e077018b3c16693",
  measurementId: "G-93FE3X4PJD",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---- Auth helpers ----
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
  return signOut(auth);
}

// Used to roll back account creation if invite code redemption fails
export function deleteCurrentUser() {
  if (auth.currentUser) return deleteUser(auth.currentUser);
  return Promise.resolve();
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ---- Firestore helpers: one document per user, all progress combined ----
export async function loadProfile(uid) {
  const ref = doc(db, "profiles", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return null;
}

export async function saveProfile(uid, data) {
  const ref = doc(db, "profiles", uid);
  await setDoc(ref, data, { merge: true });

  // Also write a small public-facing record for the leaderboard so we
  // don't need to expose full profiles (course progress, etc.) publicly.
  const lbRef = doc(db, "leaderboard", uid);
  await setDoc(lbRef, {
    displayName: data.certName || "هاكر بدون اسم",
    xp: data.xp || 0,
    ctfSolved: (data.ctfCompleted || []).length,
    updatedAt: Date.now(),
  });
}

// ---- Leaderboard: top users sorted by XP ----
export async function fetchLeaderboard(topN = 50) {
  const ref = collection(db, "leaderboard");
  const q = query(ref, orderBy("xp", "desc"), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// ---- Invite codes: each code can be used exactly once ----
// Document shape in "inviteCodes/{code}": { used: boolean, usedBy: string|null, createdAt: number }

// Atomically check a code is valid and unused, then mark it used.
// Throws an error if the code doesn't exist or was already used.
export async function redeemInviteCode(code, uid) {
  const cleanCode = code.trim().toUpperCase();
  const ref = doc(db, "inviteCodes", cleanCode);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) {
      throw new Error("invite/not-found");
    }
    const data = snap.data();
    if (data.used) {
      throw new Error("invite/already-used");
    }
    transaction.update(ref, { used: true, usedBy: uid, usedAt: Date.now() });
  });
}

// Create a fresh, unused invite code (call this yourself from the browser
// console while logged in as an admin, or build a small admin screen).
export async function createInviteCode(code) {
  const cleanCode = code.trim().toUpperCase();
  const ref = doc(db, "inviteCodes", cleanCode);
  await setDoc(ref, { used: false, usedBy: null, createdAt: Date.now() });
}
