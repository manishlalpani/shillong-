'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function PreviousResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [searchDate, setSearchDate] = useState('');
  const [filteredResult, setFilteredResult] = useState<any | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllResults = async () => {
      setLoading(true);
      const q = query(collection(db, 'teer_daily_results'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        return {
          id: doc.id,
          date: raw.date,
          firstRound: Array.isArray(raw.firstRound)
            ? raw.firstRound
            : raw.firstRound !== undefined
            ? [Number(raw.firstRound)]
            : [],
          secondRound: Array.isArray(raw.secondRound)
            ? raw.secondRound
            : raw.secondRound !== undefined
            ? [Number(raw.secondRound)]
            : [],
        };
      });
      setResults(data);
      setLoading(false);
    };

    fetchAllResults();
  }, []);

  const handleDateSearch = () => {
    if (!searchDate) return;

    const dateObj = new Date(searchDate);
    const filtered = results.find(r => {
      const resultDate = new Date(r.date.seconds * 1000);
      return (
        resultDate.getFullYear() === dateObj.getFullYear() &&
        resultDate.getMonth() === dateObj.getMonth() &&
        resultDate.getDate() === dateObj.getDate()
      );
    });

    setFilteredResult(filtered || null);
    setSearchDone(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Search Result by Date</h2>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
        />
        <button
          onClick={handleDateSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {searchDone && (
        <div className="mt-6">
          {filteredResult ? (
            <div className="bg-green-100 border border-green-300 p-4 rounded text-green-800">
              <p className="font-medium mb-1">
                <span className="font-semibold">Date:</span> {new Date(filteredResult.date.seconds * 1000).toLocaleDateString()}
              </p>
              <p><strong>First Round:</strong> {filteredResult.firstRound.join(', ')}</p>
              <p><strong>Second Round:</strong> {filteredResult.secondRound.join(', ')}</p>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-300 p-4 rounded text-red-800">
              No result found for <strong>{searchDate}</strong>.
            </div>
          )}
        </div>
      )}

     
    </div>
  );
}
