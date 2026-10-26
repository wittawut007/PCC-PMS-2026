"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = {
  validate(email: string, password: string): string | null {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "กรุณากรอกอีเมลให้ถูกต้อง";
    if (!password) return "กรุณากรอกรหัสผ่าน";
    return null;
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const err = loginSchema.validate(email, password);
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          อีเมล / Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@pcc.co.th"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A8E] focus:border-transparent transition"
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          รหัสผ่าน / Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A8E] focus:border-transparent transition"
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1E3A5F] hover:bg-[#2D5A8E] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังเข้าสู่ระบบ...
          </span>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E3A5F]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E3A5F] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-wide">PCC PMS 2026</h1>
            <p className="text-blue-200 text-sm mt-1">ระบบบริหารงานก่อสร้าง</p>
          </div>

          {/* Form wrapped in Suspense for useSearchParams */}
          <div className="px-8 py-8">
            <h2 className="text-gray-800 text-lg font-semibold mb-6">เข้าสู่ระบบ</h2>
            <Suspense fallback={
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            }>
              <LoginForm />
            </Suspense>
            <p className="text-center text-xs text-gray-400 mt-6">
              สิทธิ์การเข้าถึงกำหนดตามบทบาทในระบบ
            </p>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-4 opacity-60">
          PCC PMS 2026 © Precast Concrete Co., Ltd.
        </p>
      </div>
    </div>
  );
}
