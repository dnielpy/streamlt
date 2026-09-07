"use client";

import Image from "next/image";
import { Film } from "lucide-react";
import { useState } from "react";

type VideoThumbnailProps = {
  alt: string;
  src: string;
  sizes: string;
};

export function VideoThumbnail({ alt, src, sizes }: VideoThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <Film aria-hidden="true" className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className="object-cover transition duration-300 group-hover:scale-[1.025]"
      fill
      onError={() => setHasError(true)}
      sizes={sizes}
      src={src}
    />
  );
}
