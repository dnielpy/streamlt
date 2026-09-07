import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppLayoutContainer } from "@/src/modules/layout/containers/app-layout-container";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "LocalTube",
  description: "Your personal video library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-950">
        <AppLayoutContainer>{children}</AppLayoutContainer>
      </body>
    </html>
  );
}
