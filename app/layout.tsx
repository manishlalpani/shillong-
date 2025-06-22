import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/ui/LayoutWrapper";
import { fetchMetaAndScripts } from "@/lib/meta-actions/settings";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const metaScripts = await fetchMetaAndScripts();
  
  return {
    title: metaScripts?.metaTitle || "Default Title",
    description: metaScripts?.metaDescription || "Default description",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: metaScripts?.metaTitle || "Default Title",
      description: metaScripts?.metaDescription || "Default description",
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: metaScripts?.metaTitle || "Default Title",
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}