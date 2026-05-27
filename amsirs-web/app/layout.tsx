import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Switched to Inter for a cleaner look
import "./globals.css";
import Navbar from "./components/Navbar";
import ToasterProvider from "./components/ToasterProvider";

// Configure the Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AMSIRS | Cavite National High School",
  description: "Attendance Monitoring and Incident Reporting Security System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans bg-white text-cavite-black antialiased min-h-screen`}
      >
        {/* The 'bg-white' and 'text-cavite-black' classes here 
            apply our new Light Mode theme globally.
        */}
        <ToasterProvider />
        <Navbar />
        {children}
      </body>
    </html>
  );
}