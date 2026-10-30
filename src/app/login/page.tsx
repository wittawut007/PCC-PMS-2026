"use client";

import { Suspense, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "./login.css";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  role: string;
}

const DEMO_USERS: DemoUser[] = [
  { id: "pm", name: "สมชาย PM", email: "pm@pcc.co.th", roleLabel: "ผู้จัดการโครงการ (PM)", role: "PM" },
  { id: "qc", name: "QC Inspector", email: "qc@pcc.co.th", roleLabel: "เจ้าหน้าที่ QC", role: "QC_INSPECTOR" },
  { id: "site", name: "วิศวกรหน้างาน", email: "site@pcc.co.th", roleLabel: "วิศวกรหน้างาน", role: "SITE_ENGINEER" },
  { id: "exec", name: "ผู้บริหาร", email: "exec@pcc.co.th", roleLabel: "ผู้บริหารโครงการ", role: "EXECUTIVE" },
  { id: "owner", name: "คุณกิตติ เจ้าของโครงการ", email: "owner@pcc.co.th", roleLabel: "เจ้าของโครงการ", role: "OWNER" },
  { id: "transport", name: "พนักงานขนส่ง", email: "transport@pcc.co.th", roleLabel: "พนักงานขนส่ง (Driver)", role: "TRANSPORT" },
  { id: "engineer", name: "วิศวกรโครงการ", email: "engineer@pcc.co.th", roleLabel: "วิศวกรแบบ / โครงสร้าง", role: "ENGINEER" },
  { id: "warehouse", name: "คลังสินค้า", email: "warehouse@pcc.co.th", roleLabel: "ผู้ประสานวัสดุ / คลัง", role: "WAREHOUSE" },
  { id: "admin", name: "ผู้ดูแลระบบ", email: "admin@pcc.co.th", roleLabel: "ผู้ดูแลระบบ", role: "SYSTEM_ADMIN" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("pm@pcc.co.th");
  const [password, setPassword] = useState("PccDemo2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  // Dynamic branding text based on user input (matching web-demo line 57)
  const lowerUser = username.trim().toLowerCase();
  const isDriver = lowerUser.includes("driver") || lowerUser.includes("transport");
  const isSiteOrQc = lowerUser.includes("site") || lowerUser.includes("qc");

  let brandTitle = "PCC PMS";
  let subbrandTitle = "P R O J E C T   M A N A G E M E N T   S Y S T E M";
  let introTitle = "กรอกข้อมูลบัญชีเพื่อเข้าใช้งานระบบ";

  if (isDriver) {
    brandTitle = "PCC DELIVERY";
    subbrandTitle = "TRANSPORT OPERATIONS";
    introTitle = "สำหรับพนักงานขนส่งและผู้ที่ได้รับมอบหมาย";
  } else if (isSiteOrQc) {
    brandTitle = "PCC PMS";
    subbrandTitle = "SITE OPERATIONS";
    introTitle = "สำหรับเจ้าหน้าที่หน้างานและผู้ตรวจ QC";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณากรอกอีเมลหรือชื่อผู้ใช้");
      return;
    }
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: username.trim(),
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
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
      }
    });
  }

  function handleUseDemoAccount() {
    const chosen = DEMO_USERS[selectedDemoIndex];
    if (chosen) {
      setUsername(chosen.email);
      setPassword("PccDemo2026!");
    }
    setShowDemoModal(false);
  }

  return (
    <>
      <main className="login login-reference">
        {/* Top-right motto matching SVG Text 1-4 */}
        <div className="login-motto" aria-hidden="true">
          B U I L D<br />
          T O  A<br />
          B E T T E R<br />
          T O M O R R O W
        </div>

        {/* Bottom footer texts matching SVG Text 5-6 */}
        <div className="login-footer-brand" aria-hidden="true">
          —   P C C   P R O J E C T   M A N A G E M E N T   S Y S T E M
        </div>
        <div className="login-footer-caption" aria-hidden="true">
          บริหารงานก่อสร้าง ตั้งแต่แผนงานจนถึงส่งมอบ
        </div>

        {/* Center Login Card matching SVG Login_card 576x792 */}
        <section className="login-card" aria-labelledby="login-title">
          {/* Logo matching login-logo.svg */}
          <img
            className="login-logo"
            src="/assets/login-logo.svg"
            alt="PCC"
            width={92}
            height={83}
          />

          {/* Brand & Subbrand */}
          <div className="login-brand">{brandTitle}</div>
          <div className="login-subbrand">{subbrandTitle}</div>

          {/* Title & Intro */}
          <h1 id="login-title">เข้าสู่ระบบ</h1>
          <p className="login-intro">{introTitle}</p>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            {/* Field: Username / Email */}
            <div className="login-field login-username">
              <label htmlFor="login-user">อีเมล / ชื่อผู้ใช้</label>
              <div className="login-input">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="15" rx="2" />
                  <path d="m3 7 9 8 9-8" />
                </svg>
                <input
                  id="login-user"
                  name="userId"
                  placeholder="name@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="login-field login-password">
              <label htmlFor="login-password">รหัสผ่าน</label>
              <div className="login-input">
                <svg viewBox="0 0 24 30" aria-hidden="true">
                  <rect x="3" y="12" width="18" height="17" rx="3" />
                  <path d="M7 12V7a5 5 0 0 1 10 0v5" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="login-eye"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg viewBox="0 0 34 26" aria-hidden="true">
                    <path d="M2 13c9-12 22-12 31 0-9 12-22 12-31 0Z" />
                    <circle cx="17.5" cy="13" r="4.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Options: Remember Me & Forgot Password */}
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                จดจำการเข้าสู่ระบบ
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => setShowForgotModal(true)}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            {/* Submit Button */}
            <button className="login-submit" type="submit" disabled={isPending}>
              {isPending ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Box */}
          <div className="login-security">
            <span>
              <svg viewBox="0 0 30 34" aria-hidden="true">
                <path d="M15 3l11 5v8c0 8-11 15-11 15S4 24 4 16V8Z" />
              </svg>
            </span>
            <div>
              <b>การเข้าสู่ระบบที่ปลอดภัย</b>
              <p>
                ระบบของเรามีการป้องกันข้อมูลและเฉพาะโครงการ<br />
                ที่บัญชีของคุณได้รับอนุญาตเท่านั้น
              </p>
            </div>
          </div>
        </section>

        {/* Quick Demo Switcher Link */}
        <button
          type="button"
          className="login-demo"
          onClick={() => setShowDemoModal(true)}
        >
          เลือกบัญชีสำหรับทดสอบเดโม
        </button>
      </main>

      {/* Demo Account Modal Dialog */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#0D255B]">บัญชีสำหรับทดสอบเดโม</h2>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="demo-account-select"
                  className="block text-xs font-semibold text-[#0D255B] mb-1.5"
                >
                  เลือกบัญชีผู้ใช้งานทดสอบ
                </label>
                <select
                  id="demo-account-select"
                  value={selectedDemoIndex}
                  onChange={(e) => setSelectedDemoIndex(Number(e.target.value))}
                  className="w-full h-11 px-3 border border-[#D5E4FD] rounded-lg text-sm bg-white text-[#0D255B] focus:border-[#075DD8] focus:ring-2 focus:ring-[#075DD8]/20 outline-none"
                >
                  {DEMO_USERS.map((user, idx) => (
                    <option key={user.id} value={idx}>
                      {user.roleLabel} · {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#EFF6FF] border border-[#D5E4FD] rounded-xl p-3.5 text-xs text-[#0D255B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#596780]">บทบาท:</span>
                  <span className="font-semibold">{DEMO_USERS[selectedDemoIndex].roleLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#596780]">อีเมล:</span>
                  <span className="font-mono text-[#075DD8]">{DEMO_USERS[selectedDemoIndex].email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#596780]">รหัสผ่านเดโม:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#D5E4FD]">
                    PccDemo2026!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleUseDemoAccount}
                className="px-5 py-2 text-xs font-bold text-white bg-[#075DD8] hover:bg-[#064eb8] rounded-lg transition shadow-xs"
              >
                ใช้บัญชีนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#0D255B]">ลืมรหัสผ่าน?</h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#596780] space-y-2 leading-relaxed">
              <p>เว็บไซต์นี้เป็นระบบเดโม บัญชีทดสอบทุกบทบาทใช้รหัสผ่าน:</p>
              <div className="bg-[#EFF6FF] border border-[#D5E4FD] p-2.5 rounded-lg text-center font-mono text-[#075DD8] font-bold text-sm">
                PccDemo2026!
              </div>
              <p>
                ท่านสามารถคลิก <b>“เลือกบัญชีสำหรับทดสอบเดโม”</b> ที่ด้านล่างหน้าจอเพื่อกรอกบัญชีและรหัสผ่านตัวอย่างโดยอัตโนมัติ
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#075DD8] hover:bg-[#064eb8] rounded-lg transition shadow-xs"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F6F8FC]">
          <div className="w-10 h-10 border-4 border-[#075DD8] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
