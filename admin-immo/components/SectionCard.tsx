export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-10 flex flex-col group">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 transition-colors group-hover:bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="p-8">
        {children}
      </div>
    </div>
  );
}
