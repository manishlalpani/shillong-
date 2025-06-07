import React from "react";
import Image from "next/image";
import ScrollReveal from "@/components/Animation/ScrollReveal";

export default function PostGrid() {
  const posts = [
    {
      title: "Why Trust Our Common Numbers?",
      text: "Our common numbers are carefully calculated based on historical data, statistical analysis, and expert insights. We aim to provide you with numbers that have the highest probability of winning. Trust shillongteercommon.com for the best Shillong Teer common number predictions.",
      imageSrc: "/image1.webp",
      imageLeft: false,
      
    },
    {
      title: "How to Play Shillong Teer",
      text: `New to Shillong Teer? It’s an exciting game that’s easy to learn and fun to play. Here’s a quick guide:\n\n• Choose your numbers: Based on dreams, predictions, or intuition.\n• Place your bet: At local counters or trusted online platforms.\n• Check results: Tune in to live updates and see if you win!`,
      imageSrc: "/image 2.jpg",
      imageLeft: true,
    },
    {
      title: "Tips and Strategies",
      text: `Boost your chances of winning with our expert strategies:\n\n• Study past results: Find patterns in previous outcomes.\n• Follow expert predictions: Updated daily on our site.\n• Use tools like the Target App to improve accuracy.`,
      imageSrc: "/image3.png",
      imageLeft: false,
    },
    {
      title: "Why Trust Our Common Numbers?",
      text: "Our common numbers are calculated using a blend of data science and expert insights, making them among the most reliable predictions for Shillong Teer.",
      imageSrc: "/image1.webp",
      imageLeft: true,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12">
      {posts.map((item, index) => (
        <SectionWithImage key={index} {...item} />
      ))}
    </div>
  );
}

function SectionWithImage({
  title,
  text,
  imageSrc,
  imageLeft,
}: {
  title: string;
  text: string;
  imageSrc: string;
  imageLeft: boolean;
}) {
  return (
    <main>
    <ScrollReveal />
    <section className="py-12">
      <div
        className={`max-w-7xl mx-auto flex flex-col lg:flex-row ${
          imageLeft ? "lg:flex-row-reverse" : ""
        } items-center gap-10 px-4`}
      >
        <div className="lg:w-1/2 w-full rounded-3xl overflow-hidden shadow-xl">
          <Image
            src={imageSrc}
            alt={title}
            width={600}
            height={400}
            className="rounded-3xl w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="lg:w-1/2 w-full px-2">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-800 dark:text-white opacity-0 translate-y-8 transition-all duration-700 ease-out animate-on-scroll">
            {title}
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </section>
    </main>
  );
}
