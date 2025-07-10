"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import Header from "@/components/layout/Header";
import {Provider} from "react-redux";
import {store} from "@/store";
import UserBootstrap from "@/components/common/UserBootstrap";
import GlobalLoading from "@/components/common/GlobalLoading";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
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
          </ThemeProvider>
      </body>
    </html>
  );
}
