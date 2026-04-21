"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function BrandMark({
  href = "/",
  onClick,
  variant = "dark",
}: {
  href?: string;
  onClick?: () => void;
  variant?: "dark" | "light";
}) {
  const textClass = variant === "dark" ? "text-white" : "text-slate-900";
  const accentClass = variant === "dark" ? "text-blue-400" : "text-blue-600";

  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_12px_30px_rgba(37,99,235,0.35)]">
        <Home className="w-5 h-5 text-white" />
      </div>
      <span className={`text-xl font-extrabold tracking-tight ${textClass}`}>
        Ika<span className={accentClass}>Bayt</span>
      </span>
    </Link>
  );
}

