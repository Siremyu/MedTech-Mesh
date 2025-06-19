import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { StoreProvider } from "@/lib/store-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedTech Mesh - Medical 3D Model Sharing Platform",
  description: "Share and discover medical 3D models for education and research",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StoreProvider>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
            />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
