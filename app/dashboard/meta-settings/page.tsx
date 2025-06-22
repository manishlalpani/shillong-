import { getMetaSettings, updateMetaSettings } from "@/lib/meta-actions/settings";
import { SubmitButton } from "./submit-button";

export default async function MetaSettingsPage() {
  const data = await getMetaSettings();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Meta, SEO & Script Tags</h1>

      <form action={updateMetaSettings} className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Website Meta Title:</label>
          <input
            type="text"
            name="metaTitle"
            defaultValue={data?.metaTitle || ""}
            className="w-full p-2 border rounded"
            placeholder="Your website title"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Website Meta Description:</label>
          <textarea
            name="metaDescription"
            defaultValue={data?.metaDescription || ""}
            className="w-full p-2 border rounded h-24"
            placeholder="Short description of your website"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Google Site Verification Code:</label>
          <input
            type="text"
            name="googleSiteVerification"
            defaultValue={data?.googleSiteVerification || ""}
            className="w-full p-2 border rounded"
            placeholder="e.g. abc123..."
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Google Adsense Client ID:</label>
          <input
            type="text"
            name="googleAdsense"
            defaultValue={data?.googleAdsense || ""}
            className="w-full p-2 border rounded"
            placeholder="ca-pub-xxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Google Analytics Measurement ID:</label>
          <input
            type="text"
            name="googleAnalytics"
            defaultValue={data?.googleAnalytics || ""}
            className="w-full p-2 border rounded"
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <SubmitButton className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Save Changes
        </SubmitButton>
      </form>
    </div>
  );
}