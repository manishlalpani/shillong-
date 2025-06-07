"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ data }: { data: FAQItem[] }) {
  return (
    <Accordion type="single" collapsible className="space-y-4">
      {data.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index + 1}`}
          className="bg-green-500 dark:bg-gray-800 rounded-xl shadow-md transition-all"
        >
          <AccordionTrigger className="px-4 py-3 text-xl text-white font-semibold hover:text-yellow-200 dark:hover:text-blue-400 transition-colors">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-white dark:text-gray-300 text-lg">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
