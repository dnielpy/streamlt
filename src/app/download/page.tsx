import type { Metadata } from "next";
import { DownloadContainer } from "@/src/modules/download/components/download-container";

export const metadata: Metadata = {
  title: "Download · Streamlt",
  description: "Send a video URL to Download Manager and save it in your Streamlt library.",
};

export default function DownloadPage() {
  return <DownloadContainer />;
}
