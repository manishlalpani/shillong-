"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

// Server Actions
export async function updateMetaSettings(formData: FormData) {
  const data = {
    googleSiteVerification: formData.get("googleSiteVerification") as string,
    googleAdsense: formData.get("googleAdsense") as string,
    googleAnalytics: formData.get("googleAnalytics") as string,
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
  };

  await setDoc(doc(db, "settings", "metaAndScripts"), data, { merge: true });
  revalidatePath("/", "layout");
}

// Data Fetching (used by layout.tsx)
export async function fetchMetaAndScripts() {
  try {
    const docRef = doc(db, "settings", "metaAndScripts");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

// Alias getMetaSettings to fetchMetaAndScripts (for consistency)
export const getMetaSettings = fetchMetaAndScripts;