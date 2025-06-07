import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white">
      {/* Top footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/footerlogo.png"
            alt="Footer Logo"
            width={60}
            height={60}
            className="mb-2"
          />
          <p className="text-sm">Your Trusted News Partner</p>
        </div>

        <div>
          <h4 className="font-bold mb-1">अध्यक्ष तथा प्रबन्ध निर्देशक:</h4>
          <p>धर्मराज भुसाल</p>
        </div>

        <div>
          <h4 className="font-bold mb-1">प्रधान सम्पादक:</h4>
          <p>शिव गाउँले</p>
        </div>

        <div>
          <h4 className="font-bold mb-1">सूचना विभाग दर्ता नं.</h4>
          <p>२१४ / ०७३–७४</p>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="bg-green-900 text-center text-sm py-3">
        © {new Date().getFullYear()} Manish Upreti. All rights reserved.
      </div>
    </footer>
  );
}
