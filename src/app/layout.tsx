import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilverForge — Forge your store. Shape your brand.",
  description:
    "SilverForge is a multi-tenant e-commerce platform for building, customizing, and running your own online store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
