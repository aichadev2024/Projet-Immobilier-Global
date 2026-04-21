"use client";
import { API_BASE_URL } from "@/services/api";


import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });

    if (res.ok) {
      setMessage("Mot de passe modifié avec succès.");
    }
  };
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] px-4">
    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">

      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Nouveau mot de passe 🔐
      </h1>

      <p className="text-center text-gray-600 mb-6">
        Sécurisez votre compte avec un mot de passe fort.
      </p>

      <form onSubmit={handleReset} className="space-y-5">
        <input
          type="password"
          placeholder="Entrez votre nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />

        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition">
          Réinitialiser
        </button>
      </form>

      {message && (
        <p className="text-green-600 text-center mt-5 font-medium">
          {message}
        </p>
      )}
    </div>
  </div>
);
}