// app/(Display)/previous-result/page.tsx

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import PreviousResultsView from "./client";

export const revalidate = 60; // ISR every 60 seconds

export default async function PreviousResultsPage() {
  const q = query(
    collection(db, "teer_daily_results"),
    orderBy("date", "desc"),
    limit(100) // Fetch more for search
  );

  const snapshot = await getDocs(q);

  const results = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      date: data.date?.seconds ? new Date(data.date.seconds * 1000) : null,
      firstRound: Array.isArray(data.firstRound)
        ? data.firstRound.map(Number)
        : typeof data.firstRound === "string"
        ? data.firstRound.split(",").map((n) => Number(n.trim()))
        : [Number(data.firstRound)],
      secondRound: Array.isArray(data.secondRound)
        ? data.secondRound.map(Number)
        : typeof data.secondRound === "string"
        ? data.secondRound.split(",").map((n) => Number(n.trim()))
        : [Number(data.secondRound)],
    };
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Shillong Teer Previous Results
      </h1>

      <PreviousResultsView serverResults={results} />
    </div>
  );
}
