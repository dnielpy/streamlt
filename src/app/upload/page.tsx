import type { Metadata } from "next";
import { UploadContainer } from "@/src/modules/upload/containers/upload-container";

export const metadata: Metadata = {
  title: "Upload · Streamlt",
  description: "Upload videos to your local Streamlt library.",
};

export default function UploadPage() {
  return <UploadContainer />;
}
