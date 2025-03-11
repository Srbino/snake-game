import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snake Game - Moderní had",
  description: "Zahrajte si klasickou hru Snake s moderní grafikou vytvořenou v Reactu a Next.js",
  keywords: ["snake", "hra", "react", "next.js", "javascript", "typescript"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
