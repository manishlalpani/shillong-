import React from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const revalidate = 86400;

function formatDateISO(date: Date) {
  return date.toISOString().split('T')[0];
}

function getStartEndTimestamps(dateStr: string) {
  const date = new Date(dateStr);
  const start = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  const end = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  return { start, end };
}

interface TeerResult {
  id: string;
  date: Timestamp;
  firstRound: number[];
  secondRound: number[];
}

async function getResultByDate(dateStr: string): Promise<TeerResult | null> {
  const { start, end } = getStartEndTimestamps(dateStr);

  const resultsQuery = query(
    collection(db, 'teer_daily_results'),
    where('date', '>=', start),
    where('date', '<', end)
  );

  const snapshot = await getDocs(resultsQuery);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  // Normalize to arrays
  const firstRound = data.firstRound ? [Number(data.firstRound)] : [];
  const secondRound = data.secondRound ? [Number(data.secondRound)] : [];

  return {
    id: docSnap.id,
    date: data.date,
    firstRound,
    secondRound,
  };
}

export default async function TeerResultTodayPage() {
  const todayISO = formatDateISO(new Date());
  const result = await getResultByDate(todayISO);

  if (!result || result.firstRound.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Teer Result for {todayISO}</h2>
        <p>No result found for today.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Teer Result for {todayISO}</h2>
      <table className="min-w-full table-auto border border-gray-300 text-left text-sm md:text-base text-gray-700 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-green-200 font-semibold">
          <tr>
            <th className="border px-4 py-2 md:px-6 md:py-4">First Round</th>
            <th className="border px-4 py-2 md:px-6 md:py-4">Second Round</th>
          </tr>
        </thead>
        <tbody>
          {result.firstRound.map((num, idx) => (
            <tr key={idx} className="bg-white hover:bg-green-50 transition">
              <td className="border px-4 py-2 md:px-6 md:py-4">{num}</td>
              <td className="border px-4 py-2 md:px-6 md:py-4">
                {result.secondRound[idx] ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
