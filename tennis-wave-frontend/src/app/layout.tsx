"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import Header from "@/components/layout/Header";
import {Provider} from "react-redux";
import {store} from "@/store";
import UserBootstrap from "@/components/common/UserBootstrap";
import GlobalLoading from "@/components/common/GlobalLoading";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Provider store={store}>
              <UserBootstrap />
              <GlobalLoading />
              <Header />
              <main>{children}</main>
              <Toaster
                  position="top-center"
                  richColors
                  closeButton
              />
          </Provider>
      </body>
    </html>
  );
}
