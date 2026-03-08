import type { Metadata } from "next";
import { Syne, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskflow — Sign In",
  description: "Plan sprints, track tasks, and close projects — all in one focused workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${instrumentSans.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
