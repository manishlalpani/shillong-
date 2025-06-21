'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CURRENT_RESULT_DOC_ID = 'current_teer_result';

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
  } | null;
}

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const TeerForm: React.FC<TeerFormProps> = ({ initialData = null }) => {
  const today = getTodayDate();
  const [row1, setRow1] = useState<string[]>(['', '', '']);
  const [row2, setRow2] = useState<string[]>(['', '', '']);
  const [currentResult, setCurrentResult] = useState<TeerResult | null>(null);

  useEffect(() => {
    if (initialData) {
      setRow1(initialData.row1.map(String));
      setRow2(initialData.row2.map(String));
    }
  }, [initialData]);

  const fetchData = useCallback(async () => {
    try {
      const docRef = doc(db, 'teerResults', CURRENT_RESULT_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as TeerResult;
        setCurrentResult(data);
        
        if (data.date !== today) {
          setRow1(['', '', '']);
          setRow2(['', '', '']);
        } else {
          setRow1(data.row1.map(String));
          setRow2(data.row2.map(String));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [today]);

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
      const now = new Date().toISOString();
      const updateData: Partial<TeerResult> = {
        date: today,
        row1: parsedRow1,
        row2: parsedRow2,
        updatedAt: now,
      };

      if (currentResult) {
        await updateDoc(doc(db, 'teerResults', CURRENT_RESULT_DOC_ID), updateData);
      } else {
        await setDoc(doc(db, 'teerResults', CURRENT_RESULT_DOC_ID), {
          ...updateData,
          createdAt: now,
        });
      }

      setCurrentResult({
        date: today,
        row1: parsedRow1,
        row2: parsedRow2,
        createdAt: currentResult?.createdAt || now,
        updatedAt: now,
      });

      alert('Result saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result. Check console for details.');
    }
  }, [row1, row2, today, currentResult]);

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
    </div>
  );
};

export default TeerForm;