import { ReactNode } from "react";

interface Props {
  title: string;
  value?: number;
  icon?: ReactNode;
  button?: string;
  gradient?: string;
  shadowColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  button,
  gradient = "from-blue-500 to-indigo-600",
  shadowColor = "shadow-blue-500/30",
}: Props) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300 group overflow-hidden relative cursor-default translate-y-0 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity duration-300`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>

          {value !== undefined && (
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          )}

          {button && (
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm shadow-md transition-all">
              {button}
            </button>
          )}
        </div>

        {icon && (
          <div className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg ${shadowColor} transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-white`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
