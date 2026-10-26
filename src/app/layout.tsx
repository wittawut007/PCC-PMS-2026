import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PCC PMS 2026",
  description: "ระบบบริหารงานก่อสร้าง PCC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${notoSansThai.variable} ${notoSans.variable} font-thai antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
