import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "domkutis.com",
  description: "Full-stack developer passionate about creating beautiful, functional applications.",
  keywords: ["developer", "portfolio", "web development", "programming", "react", "nextjs", "typescript"],
  authors: [{ name: "Domkutis" }],
  openGraph: {
    title: "domkutis.com",
    description: "Full-stack developer passionate about creating beautiful, functional applications.",
    url: process.env.NEXT_PUBLIC_PROD_URL || "https://domkutis.com",
    siteName: "domkutis.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "domkutis.com",
    description: "Full-stack developer passionate about creating beautiful, functional applications.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} antialiased font-montserrat`}
      >
        {children}
      </body>
    </html>
  );
}