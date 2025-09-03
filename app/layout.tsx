"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import {
  ClerkProvider,
  useAuth,
} from "@clerk/nextjs";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import LayoutWrapper from "./components/LayoutWrapper";
// Initialize Convex client here with your env variable
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <LayoutWrapper>
            {children}
            </LayoutWrapper>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
