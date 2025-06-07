"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function MetaSettingsPage() {
  const [data, setData] = useState({
    googleSiteVerification: "",
    googleAdsense: "",
    googleAnalytics: "",
    metaTitle: "",
    metaDescription: "",
  });

  // Load existing data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "settings", "metaAndScripts");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData((prev) => ({ ...prev, ...docSnap.data() }));
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await setDoc(doc(db, "settings", "metaAndScripts"), data);
    alert("Meta, SEO & script settings updated!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Meta, SEO & Script Tags</h1>

      {/* Meta Title */}
      <label className="block mb-2 font-semibold">Website Meta Title:</label>
      <input
        type="text"
        name="metaTitle"
        value={data.metaTitle}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded"
        placeholder="Your website title"
      />

      {/* Meta Description */}
      <label className="block mb-2 font-semibold">Website Meta Description:</label>
      <textarea
        name="metaDescription"
        value={data.metaDescription}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded h-24"
        placeholder="Short description of your website"
      />

      {/* Google Site Verification */}
      <label className="block mb-2 font-semibold">Google Site Verification Code:</label>
      <input
        type="text"
        name="googleSiteVerification"
        value={data.googleSiteVerification}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded"
        placeholder="e.g. abc123..."
      />

      {/* Adsense */}
      <label className="block mb-2 font-semibold">Google Adsense Script:</label>
      <textarea
        name="googleAdsense"
        value={data.googleAdsense}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded h-24"
        placeholder="Paste full Adsense script here..."
      />

      {/* Analytics */}
      <label className="block mb-2 font-semibold">Google Analytics Script:</label>
      <textarea
        name="googleAnalytics"
        value={data.googleAnalytics}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded h-24"
        placeholder="Paste GA4 script here..."
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Save Changes
      </button>
    </div>
  );
}
