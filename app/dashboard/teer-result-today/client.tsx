'use client';

import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  Timestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

const STORAGE_KEY = 'teerDailyResultCache';

type TeerDoc = {
  id: string;
  firstRound: number;
  secondRound: number;
  date: Timestamp;
};

type CacheData = {
  date: string;
  doc: TeerDoc | null;
  firstRound: string;
  secondRound: string;
  editMode: boolean;
  editDocId: string | null;
};

export default function AddDailyResultForm() {
  const [firstRound, setFirstRound] = useState('');
  const [secondRound, setSecondRound] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayDoc, setTodayDoc] = useState<TeerDoc | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);

  // Initialize selectedDate to latest or today on mount
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'teer_daily_results'), orderBy('date', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const latestDate = latestDoc.data().date.toDate();
          setSelectedDate(latestDate.toISOString().slice(0, 10));
        } else {
          setSelectedDate(new Date().toISOString().slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching latest date:', error);
        setSelectedDate(new Date().toISOString().slice(0, 10));
      }
    })();
  }, []);

  // Load cached data from localStorage
  const loadCache = useCallback((): CacheData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cacheStr = localStorage.getItem(STORAGE_KEY);
      if (!cacheStr) return null;
      const cache: CacheData = JSON.parse(cacheStr);
      if (cache.date === selectedDate) return cache;
      return null;
    } catch {
      return null;
    }
  }, [selectedDate]);

  // Save to cache
  const saveCache = useCallback((data: CacheData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Fetch data by selectedDate
  const fetchDataByDate = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const selected = new Date(selectedDate);
      const start = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const end = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
      const startTS = Timestamp.fromDate(start);
      const endTS = Timestamp.fromDate(end);

      const q = query(
        collection(db, 'teer_daily_results'),
        where('date', '>=', startTS),
        where('date', '<', endTS)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap: QueryDocumentSnapshot<DocumentData> = snapshot.docs[0];
        const docData = { id: docSnap.id, ...docSnap.data() } as TeerDoc;

        setTodayDoc(docData);
        setFirstRound(docData.firstRound.toString());
        setSecondRound(docData.secondRound.toString());
        setEditMode(true);
        setEditDocId(docData.id);

        saveCache({
          date: selectedDate,
          doc: docData,
          firstRound: docData.firstRound.toString(),
          secondRound: docData.secondRound.toString(),
          editMode: true,
          editDocId: docData.id,
        });
      } else {
        setTodayDoc(null);
        setFirstRound('');
        setSecondRound('');
        setEditMode(false);
        setEditDocId(null);

        saveCache({
          date: selectedDate,
          doc: null,
          firstRound: '',
          secondRound: '',
          editMode: false,
          editDocId: null,
        });
      }
    } catch (error) {
      console.error('Error fetching data by date:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, saveCache]);

  // When selectedDate changes, load from cache or fetch fresh
  useEffect(() => {
    if (!selectedDate) return;
    const cachedData = loadCache();
    if (cachedData) {
      setTodayDoc(cachedData.doc);
      setFirstRound(cachedData.firstRound);
      setSecondRound(cachedData.secondRound);
      setEditMode(cachedData.editMode);
      setEditDocId(cachedData.editDocId);
    } else {
      fetchDataByDate();
    }
  }, [selectedDate, fetchDataByDate, loadCache]);

  // Handlers
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setter(e.target.value);

  const handleBulkInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => setBulkInput(e.target.value);

  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return alert('Bulk input is empty.');

    const lines = bulkInput.trim().split('\n');
    setLoading(true);

    try {
      // Using Promise.all to parallelize firestore writes could be faster but beware of rate limits
      await Promise.all(
        lines.map(async (line) => {
          const [dateStr, round1, round2] = line.trim().split(',');
          if (!dateStr || !round1 || !round2) return;

          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return;

          const num1 = parseInt(round1.trim());
          const num2 = parseInt(round2.trim());

          if (isNaN(num1) || isNaN(num2)) return;

          await addDoc(collection(db, 'teer_daily_results'), {
            date: Timestamp.fromDate(date),
            firstRound: num1,
            secondRound: num2,
          });
        })
      );

      alert('Bulk data uploaded successfully!');
      setBulkInput('');
      // Refresh data for current selectedDate in case uploaded matches
      fetchDataByDate();
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Error uploading bulk data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const num1 = parseInt(firstRound);
    const num2 = parseInt(secondRound);

    if (isNaN(num1) || isNaN(num2)) {
      alert('Enter valid numbers for both rounds.');
      return;
    }

    if (!selectedDate) {
      alert('Select a valid date.');
      return;
    }

    setLoading(true);
    try {
      const dateTS = Timestamp.fromDate(new Date(selectedDate));

      if (editMode && editDocId) {
        await updateDoc(doc(db, 'teer_daily_results', editDocId), {
          date: dateTS,
          firstRound: num1,
          secondRound: num2,
        });
        alert('Result updated successfully!');
      } else {
        await addDoc(collection(db, 'teer_daily_results'), {
          date: dateTS,
          firstRound: num1,
          secondRound: num2,
        });
        alert('Result added successfully!');
      }
      await fetchDataByDate();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todayDoc) return;
    if (!confirm('Are you sure you want to delete this result?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'teer_daily_results', todayDoc.id));
      alert('Result deleted successfully!');

      // Reset form state and cache
      setTodayDoc(null);
      setFirstRound('');
      setSecondRound('');
      setEditMode(false);
      setEditDocId(null);

      saveCache({
        date: selectedDate,
        doc: null,
        firstRound: '',
        secondRound: '',
        editMode: false,
        editDocId: null,
      });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Teer Result Entry</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleChange(setSelectedDate)}
            className="p-2 border rounded w-full"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">First Round Result</label>
          <input
            type="number"
            value={firstRound}
            onChange={handleChange(setFirstRound)}
            className="p-2 border rounded w-full"
            min={0}
            max={99}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Second Round Result</label>
          <input
            type="number"
            value={secondRound}
            onChange={handleChange(setSecondRound)}
            className="p-2 border rounded w-full"
            min={0}
            max={99}
            required
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editMode ? 'Update Result' : 'Add Result'}
          </button>

          {editMode && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      <hr className="my-8" />

      <div>
        <h3 className="text-2xl font-semibold mb-2">Bulk Upload</h3>
        <p className="mb-2 text-gray-600">Enter data in CSV format: <code>YYYY-MM-DD,firstRound,secondRound</code> each per line</p>
        <textarea
          rows={6}
          value={bulkInput}
          onChange={handleBulkInputChange}
          className="w-full p-2 border rounded resize-y"
          placeholder="2023-06-12,11,75\n2023-06-13,25,64"
        />
        <button
          onClick={handleBulkUpload}
          disabled={loading || !bulkInput.trim()}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Upload Bulk Data
        </button>
      </div>

      {loading && (
        <div className="mt-4 text-center font-semibold text-blue-600">Processing...</div>
      )}
    </div>
  );
}
