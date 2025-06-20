import DreamNumbersPage from "./client";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const revalidate = 60; // ISR: revalidate every 60 seconds

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
      createdAt: d.createdAt?.seconds ?? 0, // convert Timestamp to number
    };
  }).sort((a, b) => b.createdAt - a.createdAt);

  return <DreamNumbersPage data={data} />;
}