"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DreamEntry {
  id?: string;
  dream: string;
  direct: string;
  house: string;
  ending: string;
}

export default function DreamForm({
  entryToEdit,
  onSuccess,
}: {
  entryToEdit?: DreamEntry;
  onSuccess?: () => void;
}) {
  const [dream, setDream] = useState(entryToEdit?.dream || "");
  const [direct, setDirect] = useState(entryToEdit?.direct || "");
  const [house, setHouse] = useState(entryToEdit?.house || "");
  const [ending, setEnding] = useState(entryToEdit?.ending || "");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const entry = {
      dream,
      direct,
      house,
      ending,
      createdAt: Timestamp.now(),
    };

    try {
      if (entryToEdit?.id) {
        const ref = doc(db, "dreams", entryToEdit.id);
        await updateDoc(ref, entry);
        setMessage("✅ Entry updated successfully.");
      } else {
        await addDoc(collection(db, "dreams"), entry);
        setDream("");
        setDirect("");
        setHouse("");
        setEnding("");
        setMessage("✅ Entry added successfully.");
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save entry.");
    }

    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        placeholder="Dream description"
        required
      />
      <Input
        value={direct}
        onChange={(e) => setDirect(e.target.value)}
        placeholder="Direct (comma separated)"
      />
      <Input
        value={house}
        onChange={(e) => setHouse(e.target.value)}
        placeholder="House number(s)"
      />
      <Input
        value={ending}
        onChange={(e) => setEnding(e.target.value)}
        placeholder="Ending number(s)"
      />
      <Button type="submit">
        {entryToEdit ? "Update Entry" : "Add Entry"}
      </Button>
      {message && (
        <div className="text-sm mt-2 text-green-600 font-medium">{message}</div>
      )}
    </form>
  );
}
