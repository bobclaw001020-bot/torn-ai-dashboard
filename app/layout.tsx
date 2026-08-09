import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Torn AI Dashboard",
  description: "Private Torn City tracking and goal optimization dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
