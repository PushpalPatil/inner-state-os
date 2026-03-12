import type { Metadata } from "next";
import { Geist, Geist_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inner State OS",
  description: "Your work tools track tasks. Inner State OS tracks your mind.",
  metadataBase: new URL("https://inner-state-os.vercel.app"),
  openGraph: {
    title: "Inner State OS",
    description: "Your work tools track tasks. Inner State OS tracks your mind.",
    url: "https://inner-state-os.vercel.app",
    siteName: "Inner State OS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inner State OS",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inner State OS",
    description: "Your work tools track tasks. Inner State OS tracks your mind.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${shareTechMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
