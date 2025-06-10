'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CACHE_KEY_PREFIX = 'teer_result_';

interface TeerResult {
  date: string;
  row1: number[];
  row2: number[];
  createdAt: string;
  updatedAt: string;
}

interface TeerFormProps {
  initialData?: {
    row1: number[];
    row2: number[];
    docId: string;
  } | null;
}

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getCacheKey = (date: string): string => `${CACHE_KEY_PREFIX}${date}`;

const TeerForm: React.FC<TeerFormProps> = ({ initialData = null }) => {
  const today = getTodayDate();
  const [row1, setRow1] = useState<string[]>(['', '', '']);
  const [row2, setRow2] = useState<string[]>(['', '', '']);
  const [todayDoc, setTodayDoc] = useState<TeerResult | null>(null);
  const [allResults, setAllResults] = useState<TeerResult[]>([]);

  useEffect(() => {
    if (initialData) {
      setRow1(initialData.row1.map(String));
      setRow2(initialData.row2.map(String));
      setTodayDoc({
        date: today,
        row1: initialData.row1,
        row2: initialData.row2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [initialData, today]);

  const fetchAllResults = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teerResults'));
      const allResultsData: TeerResult[] = [];
      querySnapshot.forEach((docSnap) => {
        allResultsData.push(docSnap.data() as TeerResult);
      });
      allResultsData.sort((a, b) => (a.date < b.date ? 1 : -1));
      setAllResults(allResultsData);
    } catch (error) {
      console.error('Error fetching all results:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (!initialData) {
        let cached: TeerResult | null = null;
        if (typeof window !== 'undefined') {
          const cachedString = localStorage.getItem(getCacheKey(today));
          if (cachedString) {
            cached = JSON.parse(cachedString) as TeerResult;
          }
        }

        if (cached) {
          setTodayDoc(cached);
          setRow1(cached.row1.map(String));
          setRow2(cached.row2.map(String));
          await fetchAllResults();
          return;
        }
      }

      const docRef = doc(db, 'teerResults', today);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as TeerResult;
        setTodayDoc(data);
        setRow1(data.row1.map(String));
        setRow2(data.row2.map(String));
        if (typeof window !== 'undefined') {
          localStorage.setItem(getCacheKey(today), JSON.stringify(data));
        }
      }
      await fetchAllResults();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [today, initialData, fetchAllResults]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async () => {
    if (row1.some((n) => n.trim() === '') || row2.some((n) => n.trim() === '')) {
      alert('Please fill all 6 input fields.');
      return;
    }

    const parsedRow1 = row1.map((n) => parseInt(n.trim(), 10));
    const parsedRow2 = row2.map((n) => parseInt(n.trim(), 10));

    if (parsedRow1.some(isNaN) || parsedRow2.some(isNaN)) {
      alert('Please enter valid numbers in all fields.');
      return;
    }

    if (parsedRow1.length !== 3 || parsedRow2.length !== 3) {
      alert('Each row must have exactly 3 numbers.');
      return;
    }

    try {
      const updateData = {
        row1: parsedRow1,
        row2: parsedRow2,
        updatedAt: new Date().toISOString(),
      };

      if (todayDoc) {
        await updateDoc(doc(db, 'teerResults', today), updateData);
      } else {
        await setDoc(doc(db, 'teerResults', today), {
          ...updateData,
          date: today,
          createdAt: new Date().toISOString(),
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          getCacheKey(today),
          JSON.stringify({
            date: today,
            row1: parsedRow1,
            row2: parsedRow2,
            createdAt: todayDoc?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
      }

      setTodayDoc({
        date: today,
        row1: parsedRow1,
        row2: parsedRow2,
        createdAt: todayDoc?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await fetchAllResults();
      alert('Result saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result. Check console for details.');
    }
  }, [row1, row2, today, todayDoc, fetchAllResults]);

  const renderInputs = useCallback(
    (row: string[], setRow: React.Dispatch<React.SetStateAction<string[]>>) => (
      <div className="flex gap-3">
        {row.map((val, idx) => (
          <input
            key={idx}
            type="number"
            value={val}
            onChange={(e) => {
              const newRow = [...row];
              newRow[idx] = e.target.value;
              setRow(newRow);
            }}
            className="border border-gray-300 p-2 w-20 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="0"
            min="0"
            max="99"
          />
        ))}
      </div>
    ),
    []
  );

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
        Teer Result - {today}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Row 1</label>
          {renderInputs(row1, setRow1)}
        </div>
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Row 2</label>
          {renderInputs(row2, setRow2)}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
        type="button"
      >
        Save Result
      </button>

      <h3 className="text-xl font-semibold mt-12 mb-4 text-gray-900 border-b pb-2">
        All Results
      </h3>
      <div className="max-h-56 overflow-y-auto pr-3 space-y-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
        {allResults.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center">No results found.</p>
        ) : (
          allResults.map((r) => (
            <div
              key={r.date}
              className="text-sm p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <time className="font-semibold text-gray-800">{r.date}</time>
                <span className="text-xs text-gray-500 italic">
                  {new Date(r.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="mt-1 text-gray-700">
                <p>
                  <span className="font-medium">Row 1:</span> {r.row1.join(', ')}
                </p>
                <p>
                  <span className="font-medium">Row 2:</span> {r.row2.join(', ')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeerForm;
