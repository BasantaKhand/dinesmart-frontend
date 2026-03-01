import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ToastProvider } from "@/providers/toast-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DineSmart RMS | Restaurant Management System",
  description:
    "DineSmart RMS helps restaurants manage tables, billing, inventory, staff, and analytics from one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <ToastProvider />
            </SocketProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
