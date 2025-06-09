// app/(Display)/teer-result-today/client.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeerResultData {
  firstRound: number[];
  secondRound: number[];
  date: string;
}

interface TeerResultTodayClientProps {
  initialData?: TeerResultData | null;
}

const CACHE_KEY = 'teerResultToday';
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes in milliseconds

const TeerResultTodayClient: React.FC<TeerResultTodayClientProps> = ({ initialData = null }) => {
  const [result, setResult] = useState<TeerResultData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const cachedString = localStorage.getItem(CACHE_KEY);

      if (cachedString) {
        const { data, timestamp } = JSON.parse(cachedString);
        if (now - timestamp < CACHE_EXPIRY) {
          setResult(data);
          setLoading(false);
          return;
        }
      }

      // Query Firestore using the `date` field (type Timestamp)
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const teerQuery = query(
        collection(db, 'teer_daily_results'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(teerQuery);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        const newResult: TeerResultData = {
          firstRound: Array.isArray(data.firstRound)
            ? data.firstRound.map(Number)
            : data.firstRound !== undefined
              ? [Number(data.firstRound)]
              : [],
          secondRound: Array.isArray(data.secondRound)
            ? data.secondRound.map(Number)
            : data.secondRound !== undefined
              ? [Number(data.secondRound)]
              : [],
          date: data.date.toDate().toISOString().split('T')[0],
        };

        setResult(newResult);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newResult,
          timestamp: now,
        }));
      } else {
        setResult(null); // no result found
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: initialData,
        timestamp: Date.now()
      }));
      return;
    }

    fetchData();
  }, [initialData, fetchData]);

  if (loading) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">Teer Result for Today</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!result || result.firstRound.length === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">Teer Result for Today</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
          <p className="text-yellow-700">No result found for today yet.</p>
          <p className="text-sm text-yellow-600 mt-2">Results are typically updated after 3:30 PM and 4:30 PM.</p>
        </div>
      </div>
    );
  }

  const displayDate = new Date(result.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Teer Result for {displayDate}</h2>
      <table className="min-w-full table-auto border border-gray-300 text-left text-sm md:text-base text-gray-700 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-green-200 font-semibold">
          <tr>
            <th className="border px-4 py-2 md:px-6 md:py-4">First Round</th>
            <th className="border px-4 py-2 md:px-6 md:py-4">Second Round</th>
          </tr>
        </thead>
        <tbody>
          {result.firstRound.map((num, idx) => (
            <tr key={`${num}-${idx}`} className="bg-white hover:bg-green-50 transition">
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
};

export default TeerResultTodayClient;
