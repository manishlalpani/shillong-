'use client';

import { useState, useEffect, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';

type TeerResult = {
  id: string;
  row1: number[];
  row2: number[];
  createdAt: Timestamp;
};

const CACHE_KEY_PREFIX = 'teer_result_cache_';

export default function TeerResultManager() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [row1, setRow1] = useState(['', '', '']);
  const [row2, setRow2] = useState(['', '', '']);
  const [todayDoc, setTodayDoc] = useState<TeerResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cacheKey = `${CACHE_KEY_PREFIX}${selectedDate}`;

  useEffect(() => {
    // Check if cached data date matches selectedDate
    const getCachedData = (): TeerResult | null => {
      const cachedString = localStorage.getItem(cacheKey);
      if (!cachedString) return null;
      try {
        const cached = JSON.parse(cachedString);
        if (cached?.cachedForDate === selectedDate && cached.data) {
          return cached.data as TeerResult;
        }
        return null;
      } catch {
        return null;
      }
    };
    
    const fetchDataByDate = async () => {
      setLoading(true);
      try {
        // Check cache first (valid for the whole selectedDate)
        const cachedData = getCachedData();
        if (cachedData) {
          setTodayDoc(cachedData);
          setLoading(false);
          return;
        }

        // Not cached or cache expired, fetch fresh
        const selected = new Date(selectedDate);
        const start = new Date(
          selected.getFullYear(),
          selected.getMonth(),
          selected.getDate()
        );
        const end = new Date(
          selected.getFullYear(),
          selected.getMonth(),
          selected.getDate() + 1
        );
        const startTS = Timestamp.fromDate(start);
        const endTS = Timestamp.fromDate(end);

        const q = query(
          collection(db, 'teer_results'),
          where('createdAt', '>=', startTS),
          where('createdAt', '<', endTS),
          limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = { id: docSnap.id, ...docSnap.data() } as TeerResult;
          setTodayDoc(data);

          // Save to cache with date tag
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ cachedForDate: selectedDate, data })
          );
        } else {
          setTodayDoc(null);
          localStorage.removeItem(cacheKey);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTodayDoc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDataByDate();
  }, [selectedDate, cacheKey]);

  const clearCacheForDate = (date: string) => {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`);
  };

  const handleInputChange = (
    row: 'row1' | 'row2',
    index: number,
    value: string
  ) => {
    const updater = row === 'row1' ? [...row1] : [...row2];
    updater[index] = value;
    row === 'row1' ? setRow1(updater) : setRow2(updater);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedRow1 = row1.map((n) => parseInt(n));
    const parsedRow2 = row2.map((n) => parseInt(n));
    if ([...parsedRow1, ...parsedRow2].some(isNaN)) {
      alert('Please enter all numbers correctly.');
      return;
    }

    const dateTS = Timestamp.fromDate(new Date(selectedDate));
    setLoading(true);

    try {
      if (editMode && editDocId) {
        await updateDoc(doc(db, 'teer_results', editDocId), {
          row1: parsedRow1,
          row2: parsedRow2,
          createdAt: dateTS,
        });
        alert('Result updated!');
      } else {
        await addDoc(collection(db, 'teer_results'), {
          row1: parsedRow1,
          row2: parsedRow2,
          createdAt: dateTS,
        });
        alert('Result added!');
      }

      clearCacheForDate(selectedDate); // Clear cache on update to force refetch

      // Reset form & states
      setRow1(['', '', '']);
      setRow2(['', '', '']);
      setEditMode(false);
      setEditDocId(null);

      // Refetch fresh data and cache again
      const selected = new Date(selectedDate);
      const start = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );
      const end = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate() + 1
      );
      const startTS = Timestamp.fromDate(start);
      const endTS = Timestamp.fromDate(end);

      const q = query(
        collection(db, 'teer_results'),
        where('createdAt', '>=', startTS),
        where('createdAt', '<', endTS),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() } as TeerResult;
        setTodayDoc(data);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ cachedForDate: selectedDate, data })
        );
      } else {
        setTodayDoc(null);
        localStorage.removeItem(cacheKey);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!todayDoc) return;
    setRow1(todayDoc.row1.map((n) => n.toString()));
    setRow2(todayDoc.row2.map((n) => n.toString()));
    setEditMode(true);
    setEditDocId(todayDoc.id);
  };

  const handleDelete = async () => {
    if (!todayDoc) return;
    if (confirm('Are you sure you want to delete this result?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'teer_results', todayDoc.id));
        setTodayDoc(null);
        clearCacheForDate(selectedDate);
        alert('Deleted successfully!');
      } catch (error) {
        console.error(error);
        alert('Error deleting document.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teer Result Manager</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Row 1</label>
          <div className="flex gap-2">
            {row1.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(e) => handleInputChange('row1', index, e.target.value)}
                className="w-16 p-2 border rounded"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold">Row 2</label>
          <div className="flex gap-2">
            {row2.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(e) => handleInputChange('row2', index, e.target.value)}
                className="w-16 p-2 border rounded"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Submitting...' : editMode ? 'Update Result' : 'Submit Result'}
        </button>
      </form>

      {loading && !editMode && (
        <p className="mt-4 text-gray-500">Loading result...</p>
      )}

      {todayDoc && !loading && (
        <div className="mt-8 p-4 border bg-gray-50 rounded shadow">
          <h3 className="font-bold mb-2">Results for {selectedDate}:</h3>
          <p>
            <strong>Row 1:</strong> {todayDoc.row1.join(', ')}
          </p>
          <p>
            <strong>Row 2:</strong> {todayDoc.row2.join(', ')}
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
