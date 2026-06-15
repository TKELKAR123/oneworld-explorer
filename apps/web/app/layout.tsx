import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "oneworld Explorer Route Builder",
  description: "Plan and validate oneworld Explorer round-the-world routes",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
