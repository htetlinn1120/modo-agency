import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MODO — Branding · Creative · Digital",
  description:
    "MODO is a branding agency creating brands, experiences and digital ideas that move businesses forward.",
  keywords: [
    "MODO",
    "MODO Branding Agency",
    "Branding Agency",
    "Digital Marketing",
    "Graphic Design",
    "Brand Identity",
    "Content Creation",
  ],
  authors: [{ name: "MODO Branding Agency" }],
  creator: "MODO Branding Agency",
  openGraph: {
    title: "MODO — Branding · Creative · Digital",
    description:
      "We build brands, experiences and digital ideas that move businesses forward.",
    type: "website",
  },
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
