import type { Metadata } from "next";
import { AppLayoutContainer } from "@/src/modules/layout/containers/app-layout-container";
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
        <AppLayoutContainer>{children}</AppLayoutContainer>
      </body>
    </html>
  );
}
