// lib/fetchData.ts
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getDreamData() {
  // Skip Firebase during build
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, "dreams"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.seconds ?? 0
    })).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Firebase error:", error);
    return [];
  }
}