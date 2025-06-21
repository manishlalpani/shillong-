export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CommonNumber from "@/app/(Home)/common-client";
import Link from "next/link";
import FooterFAQSection from "../Faq/page";
import PostGrid from "../Post/page";
import ScrollReveal from "@/components/Animation/ScrollReveal";

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      <main>
        {/* Hero Section */}
        <section className="pt-10 md:pt-20 px-4 animate-fade-in">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Shillong Teer Common Number
              </h1>
              <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
                Welcome to <strong>shillongteercommon.com</strong>, your
                ultimate destination for accurate Shillong Teer common numbers.
                Our team of experts diligently analyzes the latest trends and
                patterns to bring you the most reliable predictions.
              </p>
              <p className="text-lg text-gray-700 font-medium leading-relaxed">
                Whether you’re a seasoned player or new to the game, we provide
                all the information you need to maximize your chances of
                winning.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <CommonNumber />
            </div>
          </div>
        </section>

        {/* TEER UPDATES Section */}
        <ScrollReveal />
        <section className="py-20 bg-gradient-to-b from-green-50 to-green-100">
          <div className="max-w-7xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 text-gray-800 dark:text-white animate-fade-in">
              TEER UPDATES
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[{
                title: "Teer Result Today",
                href: "/teer-result-today"
              }, {
                title: "Previous Result",
                href: "/previous-result"
              }, {
                title: "Dream Number",
                href: "/dream-number"
              }, {
                title: "Common Number",
                href: "/common-number"
              }, {
                title: "Night Teer Result",
                href: "/night-teer-result"
              }, {
                title: "Juwai Teer Result",
                href: "/juwai-teer-result"
              }].map(({ title, href }, idx) => (
                <Link
                  href={href}
                  key={idx}
                  className="bg-white border border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <p className="text-xl font-semibold text-green-700">{title}</p>
                  <p className="mt-2 text-sm text-gray-500">Latest Updated Info</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <PostGrid />

        <section className="py-20 bg-green-100 text-center px-4 animate-fade-in">
          <h3 className="uppercase tracking-wider text-green-700 font-bold text-2xl mb-10">
            Live Updates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10">
            {Array(3).fill(0).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <p className="text-5xl font-extrabold text-green-600">+100%</p>
                <p className="text-lg font-medium mt-2 text-gray-700">Stats Information</p>
              </div>
            ))}
          </div>
          <p className="text-lg md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Never miss a beat with our live Shillong Teer updates. We provide
            real-time information on results, common numbers, and more. Stay
            informed and stay ahead in the game.
          </p>
        </section>

        <FooterFAQSection />
      </main>
    </div>
  );
}