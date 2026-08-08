import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Torn AI Dashboard",
  description: "Private Torn City family dashboard with sync, history, calculations, and AI goal recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
