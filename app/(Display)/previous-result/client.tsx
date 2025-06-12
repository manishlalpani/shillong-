'use client';

import { useState } from 'react';

interface TeerResult {
  id: string;
  date: Date | null;
  firstRound: number[];
  secondRound: number[];
}

export default function PreviousResultsView({ serverResults }: { serverResults: TeerResult[] }) {
  const [searchDate, setSearchDate] = useState('');
  const [filteredResult, setFilteredResult] = useState<TeerResult | null>(null);
  const [searchDone, setSearchDone] = useState(false);

  const handleDateSearch = () => {
    if (!searchDate) {
      setFilteredResult(null);
      setSearchDone(false);
      return;
    }

    const dateObj = new Date(searchDate);
    const filtered = serverResults.find((r) => {
      if (!r.date) return false;
      return (
        r.date.getFullYear() === dateObj.getFullYear() &&
        r.date.getMonth() === dateObj.getMonth() &&
        r.date.getDate() === dateObj.getDate()
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
          onChange={(e) => setSearchDate(e.target.value)}
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
                <span className="font-semibold">Date:</span>{' '}
                {filteredResult.date?.toLocaleDateString()}
              </p>
              <p>
                <strong>First Round:</strong> {filteredResult.firstRound.join(', ')}
              </p>
              <p>
                <strong>Second Round:</strong> {filteredResult.secondRound.join(', ')}
              </p>
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
