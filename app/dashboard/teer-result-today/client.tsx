'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [bulkInput, setBulkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayDoc, setTodayDoc] = useState<TeerDoc | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);

  const loadCache = (): CacheData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cacheString = localStorage.getItem(STORAGE_KEY);
      if (!cacheString) return null;
      const cache: CacheData = JSON.parse(cacheString);
      if (cache && cache.date === selectedDate) return cache;
      return null;
    } catch {
      return null;
    }
  };

  const saveCache = (data: CacheData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const fetchDataByDate = useCallback(async () => {
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
      const docData = {
        id: docSnap.id,
        ...docSnap.data(),
      } as TeerDoc;

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
  }, [selectedDate]);

  useEffect(() => {
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
  }, [selectedDate, fetchDataByDate]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) =>
    setter(e.target.value);

  const handleBulkInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBulkInput(e.target.value);
  };

  const handleBulkUpload = async () => {
    const lines = bulkInput.split('\n');
    setLoading(true);

    try {
      for (const line of lines) {
        const [dateStr, round1, round2] = line.trim().split(',');
        if (!dateStr || !round1 || !round2) continue;

        const date = new Date(dateStr);
        const dateTS = Timestamp.fromDate(date);
        const num1 = parseInt(round1.trim());
        const num2 = parseInt(round2.trim());

        if (!isNaN(num1) && !isNaN(num2)) {
          await addDoc(collection(db, 'teer_daily_results'), {
            date: dateTS,
            firstRound: num1,
            secondRound: num2,
          });
        }
      }
      alert('Bulk data uploaded successfully!');
      setBulkInput('');
    } catch (err) {
      console.error(err);
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

    const dateTS = Timestamp.fromDate(new Date(selectedDate));
    setLoading(true);

    try {
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
    } catch (err) {
      console.error(err);
      alert('Error submitting data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todayDoc) return;
    if (!confirm('Are you sure you want to delete this result?')) return;

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
    } catch (err) {
      console.error(err);
      alert('Error deleting document.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teer Result Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-semibold block mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleChange(setSelectedDate)}
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="font-semibold">First Round</label>
          <input
            type="number"
            value={firstRound}
            onChange={handleChange(setFirstRound)}
            className="w-24 p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Second Round</label>
          <input
            type="number"
            value={secondRound}
            onChange={handleChange(setSecondRound)}
            className="w-24 p-2 border rounded mt-1"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Submitting...' : editMode ? 'Update Result' : 'Submit Result'}
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Bulk Upload (Format: YYYY-MM-DD,first,second)</h3>
        <textarea
          rows={6}
          value={bulkInput}
          onChange={handleBulkInputChange}
          className="w-full p-2 border rounded"
          placeholder="Example:\n2024-06-01,23,45\n2024-06-02,56,12"
        />
        <button
          onClick={handleBulkUpload}
          disabled={loading}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload Bulk Data'}
        </button>
      </div>

      {editMode && todayDoc && (
        <div className="mt-8">
          <h4 className="text-md font-semibold mb-2">Existing Entry</h4>
          <p>
            Date: <strong>{selectedDate}</strong>
            <br />
            First Round: <strong>{todayDoc.firstRound}</strong>
            <br />
            Second Round: <strong>{todayDoc.secondRound}</strong>
          </p>
          <button
            onClick={handleDelete}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Delete Entry
          </button>
        </div>
      )}
    </div>
  );
}
