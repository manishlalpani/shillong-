import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import PreviousResultsView from "@/components/preview/previous-result/page";

export default async function PreviousResultsPage() {
  const q = query(
    collection(db, "teer_daily_results"),
    orderBy("date", "desc"),
    limit(3)
  );

  const snapshot = await getDocs(q);

  const top3 = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      jsDate: data.date?.seconds ? new Date(data.date.seconds * 1000) : null,
      firstRound: Array.isArray(data.firstRound)
        ? data.firstRound
        : typeof data.firstRound === "string"
        ? data.firstRound.split(",").map((n) => n.trim())
        : [data.firstRound],
      secondRound: Array.isArray(data.secondRound)
        ? data.secondRound
        : typeof data.secondRound === "string"
        ? data.secondRound.split(",").map((n) => n.trim())
        : [data.secondRound],
    };
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Shillong Teer Previous Results
      </h1>
      <PreviousResultsView />

      {/* Top 5 server-side results */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
          Top 5 Recent Results
        </h2>
        <ul className="space-y-4">
          {top3.map((r, idx) => (
            <li
              key={idx}
              className="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <p className="font-medium text-gray-800">
                {r.jsDate ? r.jsDate.toLocaleDateString() : "Invalid Date"}
              </p>
              <p>
                <strong>First Round:</strong> {r.firstRound.join(", ")}
              </p>
              <p>
                <strong>Second Round:</strong> {r.secondRound.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Client-side full results and search */}
    </div>
  );
}
