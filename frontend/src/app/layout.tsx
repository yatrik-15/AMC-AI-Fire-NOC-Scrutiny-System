import type { Metadata } from "next";
import "./globals.css";
import "../styles/animations.css";

export const metadata: Metadata = {
  title: "AMC Fire NOC Scrutiny System — AI Blueprint Validation",
  description:
    "Enterprise-grade deterministic architectural blueprint validation for Ahmedabad Municipal Corporation. " +
    "Validates 2D CAD blueprints against NBC 2016 Part 4 and Gujarat Fire Act 2013.",
  keywords: [
    "AMC",
    "Fire NOC",
    "NBC 2016",
    "Blueprint Validation",
    "CAD",
    "DXF",
    "Compliance",
    "Ahmedabad",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
