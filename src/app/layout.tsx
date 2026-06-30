import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Sylwinder 808",
    template: "%s | Sylwinder 808",
  },
  description: "Frontend Website + Admin Panel + Server API",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}