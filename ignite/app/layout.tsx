import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KKC Ignite — Kalam Knowledge Club Inauguration",
  description:
    "Join the collective ignition. Tap to power the launch of the Kalam Knowledge Club.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}
