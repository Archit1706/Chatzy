import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = "https://chatzy-4x9n.onrender.com";
const description =
  "Chatzy is an ephemeral real-time chat: nothing is saved on the server. Self-destruct timers, emoji reactions, replies, dark mode, and a minimal modern UI.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chatzy — Ephemeral Real-Time Chat",
    template: "%s · Chatzy",
  },
  description,
  applicationName: "Chatzy",
  authors: [{ name: "Archit Rathod", url: "https://github.com/Archit1706" }],
  creator: "Archit Rathod",
  publisher: "Archit Rathod",
  keywords: [
    "chat",
    "ephemeral chat",
    "secret chat",
    "real-time chat",
    "websocket chat",
    "self-destruct messages",
    "Next.js chat",
    "Chatzy",
  ],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Chatzy",
    title: "Chatzy — Ephemeral Real-Time Chat",
    description,
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Chatzy" }],
  },
  twitter: {
    card: "summary",
    title: "Chatzy — Ephemeral Real-Time Chat",
    description,
    images: ["/icon.svg"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
