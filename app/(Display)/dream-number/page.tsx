import DreamNumbersPage from "./client";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Update these exports at the top of your file
export const dynamic = 'force-dynamic';  // Disables all caching
export const revalidate = 0;            // Equivalent to no cache

export default async function Page() {
  const snapshot = await getDocs(collection(db, "dreams"));

  const data = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      dream: d.dream ?? "",
      direct: d.direct ?? "",
      house: d.house ?? "",
      ending: d.ending ?? "",
      createdAt: d.createdAt?.seconds ?? 0,
    };
  }).sort((a, b) => b.createdAt - a.createdAt);

  return <DreamNumbersPage data={data} />;
}