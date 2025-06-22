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
  allResults: TeerDoc[];
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
  const [allResults, setAllResults] = useState<TeerDoc[]>([]);

  // Get current date in local timezone
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize selectedDate to today on mount
  useEffect(() => {
    const today = getCurrentDate();
    setSelectedDate(today);
    fetchAllResults();
  }, []);

  // Load cached data from localStorage
  const loadCache = useCallback((): CacheData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cacheStr = localStorage.getItem(STORAGE_KEY);
      if (!cacheStr) return null;
      return JSON.parse(cacheStr);
    } catch {
      return null;
    }
  }, []);

  // Save to cache
  const saveCache = useCallback((data: Partial<CacheData>) => {
    if (typeof window === 'undefined') return;
    const currentCache = loadCache() || {} as CacheData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentCache, ...data }));
  }, [loadCache]);

  // Fetch all results for the list view
  const fetchAllResults = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'teer_daily_results'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeerDoc[];
      
      setAllResults(results);
      saveCache({ allResults: results });
    } catch (error) {
      console.error('Error fetching all results:', error);
    } finally {
      setLoading(false);
    }
  }, [saveCache]);

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
        where('date', '<', endTS),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
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
    if (cachedData && cachedData.date === selectedDate) {
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
      const BATCH_SIZE = 500;
      for (let i = 0; i < lines.length; i += BATCH_SIZE) {
        const batchLines = lines.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batchLines.map(async (line) => {
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
      }

      alert('Bulk data uploaded successfully!');
      setBulkInput('');
      fetchDataByDate();
      fetchAllResults();
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
      await fetchAllResults();
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

      await fetchAllResults();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting document.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditResult = (result: TeerDoc) => {
    const date = result.date.toDate();
    const dateStr = date.toISOString().split('T')[0];
    
    setSelectedDate(dateStr);
    setFirstRound(result.firstRound.toString());
    setSecondRound(result.secondRound.toString());
    setEditMode(true);
    setEditDocId(result.id);
    setTodayDoc(result);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'teer_daily_results', id));
      alert('Result deleted successfully!');
      
      // If we're deleting the currently displayed doc, reset the form
      if (editDocId === id) {
        setFirstRound('');
        setSecondRound('');
        setEditMode(false);
        setEditDocId(null);
        setTodayDoc(null);
      }
      
      await fetchAllResults();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Teer Result Entry</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block font-semibold mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleChange(setSelectedDate)}
            className="p-2 border rounded w-full"
            max={getCurrentDate()}
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

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
          >
            {editMode ? 'Update Result' : 'Add Result'}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Bulk Upload (Date,FirstRound,SecondRound)</h3>
        <textarea
          rows={6}
          value={bulkInput}
          onChange={handleBulkInputChange}
          placeholder="2024-06-12,11,12&#10;2024-06-13,21,22"
          className="w-full p-2 border rounded resize-none"
          disabled={loading}
        />
        <button
          onClick={handleBulkUpload}
          disabled={loading}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Upload Bulk Data
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">All Results</h3>
          <button
            onClick={fetchAllResults}
            disabled={loading}
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">First Round</th>
                <th className="py-2 px-4 border">Second Round</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allResults.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No results found'}
                  </td>
                </tr>
              )}
              {allResults.map((result) => {
                const date = result.date.toDate();
                const dateStr = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border text-center">{dateStr}</td>
                    <td className="py-2 px-4 border text-center">{result.firstRound}</td>
                    <td className="py-2 px-4 border text-center">{result.secondRound}</td>
                    <td className="py-2 px-4 border text-center">
                      <button
                        onClick={() => handleEditResult(result)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <p className="mt-4 text-center font-semibold">Loading...</p>}
    </div>
  );
}