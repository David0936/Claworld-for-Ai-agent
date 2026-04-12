import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/context";

export const metadata: Metadata = {
  title: "Claworld",
  description: "AI Agent Visualization Dashboard · Powered by OpenClaw",
  icons: {
    icon: "/branding/logo-light.png",
    shortcut: "/branding/logo-light.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
