import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ภาพรวมงานวันนี้
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          ยินดีต้อนรับ, {session.user.name}
        </p>
      </div>

      {/* Placeholder Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "โครงการที่ดำเนินการ", value: "—", color: "bg-blue-500" },
          { label: "งานรออนุมัติ", value: "—", color: "bg-amber-500" },
          { label: "QC รอตรวจ", value: "—", color: "bg-purple-500" },
          { label: "วัสดุรอรับ", value: "—", color: "bg-green-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className={`w-8 h-1.5 ${stat.color} rounded-full mb-3`} />
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Phase 0 Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Phase 0 — Setup & Foundation เสร็จสิ้น</h3>
            <p className="text-blue-600 text-sm mt-1">
              ระบบพร้อมแล้ว กำลังเตรียมพัฒนา Phase 1 — Project Core & Dashboard
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["✅ Next.js 15", "✅ Prisma Schema", "✅ NextAuth.js", "✅ Design System", "⏳ PostgreSQL Setup"].map(item => (
                <span key={item} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
