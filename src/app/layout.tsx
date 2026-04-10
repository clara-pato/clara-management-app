import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clara Management",
  description: "Clara OS Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <MobileNav />
        <Sidebar />
        <main className="flex-1 relative overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
