// app/(Display)/teer-result-today/client.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

const CACHE_KEY = 'teerResultToday';
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes in milliseconds

const TeerResultTodayClient: React.FC<TeerResultTodayClientProps> = ({ initialData = null }) => {
  const [result, setResult] = useState<TeerResultData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check cache first (synchronous)
      const now = Date.now();
      const cachedString = localStorage.getItem(CACHE_KEY);
      
      if (cachedString) {
        const { data, timestamp } = JSON.parse(cachedString);
        // Use cache if it's less than 15 minutes old
        if (now - timestamp < CACHE_EXPIRY) {
          setResult(data);
          setLoading(false);
          return;
        }
      }

      // 2. Fetch from Firestore if no valid cache
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
        
        // Update cache with timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newResult,
          timestamp: now
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip client-side fetch if we already have initial data from server
    if (initialData) {
      // Still update the cache with the server data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: initialData,
        timestamp: Date.now()
      }));
      return;
    }
    
    fetchData();
  }, [initialData, fetchData]);

  // Render loading state
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

  // Render no data state
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

  // Format date for display
  const displayDate = new Date(result.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Render results table
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
