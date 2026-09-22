import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "NOBYDERM | Skin Clinic & Aesthetic Solutions",
  description: "Modern dermatological and aesthetic beauty platform by NOBYDERM.",
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
      <body className="min-h-full flex flex-col text-zinc-900 dark:text-zinc-100 selection:bg-rose-100 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}
