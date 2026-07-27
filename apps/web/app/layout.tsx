import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const fontVariables = `${manrope.variable} ${jetBrainsMono.variable}`;

export const metadata: Metadata = {
  title: "Northstar CMS",
  description: "Editorial workspace for managing pages, content, and publishing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontVariables} min-h-full flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
