"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const videoUrl = ""; // À remplir par une URL YouTube/Vimeo ou vidéo locale

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
      </div>
      <div className="relative z-10 text-center px-4">
        <button
          type="button"
          onClick={() => videoUrl && setPlaying(true)}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-2xl mx-auto mb-6 transition-transform hover:scale-105"
          aria-label="Regarder la vidéo"
        >
          <Play className="w-10 h-10 md:w-12 md:h-12 ml-1" fill="currentColor" />
        </button>
        <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wider mb-2">
          Regarder la vidéo
        </h2>
        <p className="text-white/80 text-base md:text-lg">
          Découvrez notre présentation en vidéo
        </p>
      </div>
    </section>
  );
}
