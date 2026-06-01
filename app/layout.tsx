import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "การบ้านของฉัน",
  description: "แอพจดการบ้าน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}