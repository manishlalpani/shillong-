// components/TeerResultTodayClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeerResultData {
  firstRound: number[];
  secondRound: number[];
  date: string;
}

interface TeerResultTodayClientProps {
  initialData?: TeerResultData | null;
}

const TeerResultTodayClient: React.FC<TeerResultTodayClientProps> = ({ initialData = null }) => {
  const [result, setResult] = useState<TeerResultData | null>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip if we already have initial data
    if (initialData) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Check cache first (synchronous)
        const cachedData = localStorage.getItem('teerResultToday');
        if (cachedData) {
          setResult(JSON.parse(cachedData));
          return;
        }

        // 2. Fetch from Firestore if no cache
        const todayISO = new Date().toISOString().split('T')[0];
        const docRef = doc(db, 'teer_daily_results', todayISO);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
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
            date: todayISO
          };
          setResult(newResult);
          localStorage.setItem('teerResultToday', JSON.stringify(newResult));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData]); // Only dependency needed

  // Render loading or no data state
  if (!result || result.firstRound.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Teer Result for Today</h2>
        <p>{loading ? 'Loading...' : 'No result found for today.'}</p>
      </div>
    ); 
  }

  // Render results table
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Teer Result for {result.date}</h2>
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