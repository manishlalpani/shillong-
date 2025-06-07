// No "use client" here – this is a Server Component
import FAQAccordion from "@/app/Faq/client";

export default function FooterFAQSection() {
  const faqData = [
    {
      question: "What is the Shillong Teer common number?",
      answer:
        "It's a predicted number based on previous Shillong Teer results, helping players estimate possible winning numbers.",
    },
    {
      question: "How do I find today’s Shillong Teer common number?",
      answer:
        "You can check daily predictions on trusted Teer websites. Common numbers are derived from dream interpretations and past result trends.",
    },
    {
      question: "Are Shillong Teer common numbers accurate?",
      answer:
        "While not 100% accurate, they are often used as reference points by regular players. They’re based on historical data analysis and dream calculation logic.",
    },
    {
      question: "Where can I check Shillong Teer results and common numbers?",
      answer:
        "Visit platforms like shillongteercommon.com to view daily results, previous numbers, and expert common number predictions.",
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-16 px-4 md:px-8 border-t border-gray-200 dark:border-gray-700 rounded-t-3xl">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Shillong Teer Common Number – FAQ
        </h2>

        {/* Client Component statically imported */}
        <FAQAccordion data={faqData} />
      </div>
    </section>
  );
}
