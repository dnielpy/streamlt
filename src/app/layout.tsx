import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { AppLayoutContainer } from "@/src/modules/layout/components/app-layout-container";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalTube",
  description: "Your personal video library.",
  icons: {
    icon: [{ url: "/streamlt-logo.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <NextTopLoader
          color="#FF1B2D"
          crawl
          crawlSpeed={200}
          easing="ease"
          height={2}
          initialPosition={0.08}
          shadow="0 0 8px rgb(255 27 45 / 45%)"
          showForHashAnchor={false}
          showSpinner={false}
          speed={200}
          zIndex={100}
        />
        <AppLayoutContainer>{children}</AppLayoutContainer>
      </body>
    </html>
  );
}
