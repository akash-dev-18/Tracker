import "@fontsource/iosevka-aile/400";
import "@fontsource/iosevka-aile/500";
import "@fontsource/iosevka-aile/600";
import "@fontsource/iosevka-etoile/400";
import "@fontsource/iosevka/400";
import "@fontsource/iosevka/500";

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Docket — Study & Career Register",
    template: "%s · Docket",
  },
  description:
    "A private register for DSA practice, job applications, and projects. Track what matters, review on time, and keep moving.",
  applicationName: "Docket",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    title: "Docket",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            className: "font-sans",
            style: {
              background: "rgba(16, 18, 21, 0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e9e5dc",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </body>
    </html>
  );
}
