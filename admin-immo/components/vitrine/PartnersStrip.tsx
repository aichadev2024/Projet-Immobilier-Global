"use client";

export default function PartnersStrip() {
  const partners = [
    { name: "Partenaire 1", label: "Partner One" },
    { name: "Partenaire 2", label: "Partner Two" },
    { name: "Partenaire 3", label: "Partner Three" },
    { name: "Partenaire 4", label: "Partner Four" },
    { name: "Partenaire 5", label: "Partner Five" },
  ];

  return (
    <section className="py-10 md:py-14 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-center h-10 text-slate-400 font-bold text-lg tracking-tight opacity-70 hover:opacity-100 transition-opacity"
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
