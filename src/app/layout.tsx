import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { Header } from "@/components/header";
import { siteConfig } from "../../config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate favicon based on config
function generateFavicon(): string {
  if (siteConfig.favicon.type === 'emoji') {
    // Convert emoji to SVG for favicon
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${siteConfig.favicon.value}</text></svg>`;
  } else if (siteConfig.favicon.type === 'svg') {
    return `data:image/svg+xml,${encodeURIComponent(siteConfig.favicon.value)}`;
  }
  return siteConfig.favicon.value;
}

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: generateFavicon(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.defaultLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}
      >
        <I18nProvider>
          <ThemeProvider>
            <SessionProvider>
              <Header />
              <main className="py-6">
                {children}
              </main>
            </SessionProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
