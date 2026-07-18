import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rectoverso - Influencer Marketing Platform",
  description: "Manage your influencer marketing campaigns with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-full bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
