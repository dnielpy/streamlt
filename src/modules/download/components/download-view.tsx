"use client";

import Link from "next/link";
import { CheckCircle2, Download, ExternalLink, FolderDown, Link2, LoaderCircle, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/src/modules/common/components/button";

type DownloadResult = {
  id: string;
  fileName: string;
  status: string;
};

type DownloadViewProps = {
  destinationLabel: string;
  managerUrl: string | null;
};

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || `The request failed with HTTP ${response.status}.`;
  } catch {
    return `The request failed with HTTP ${response.status}.`;
  }
}

export function DownloadView({ destinationLabel, managerUrl }: DownloadViewProps) {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error(await getErrorMessage(response));
      const payload = (await response.json()) as { download: DownloadResult };
      setResult(payload.download);
      setUrl("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "The download could not be added.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-0 sm:px-1">
      <div className="mb-7 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Download Manager</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Download a video</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Paste a direct video link. Download Manager will handle it in the background and save it to your Streamlt library.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/35 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-background text-foreground shadow-sm ring-1 ring-border">
              <FolderDown className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Save destination</p>
              <p className="truncate text-sm font-semibold text-foreground">{destinationLabel}</p>
            </div>
          </div>
        </div>

        <form className="p-5 sm:p-6" onSubmit={(event) => void handleSubmit(event)}>
          <label className="text-sm font-semibold text-foreground" htmlFor="video-download-url">Video URL</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                autoComplete="off"
                autoFocus
                className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-[15px] shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/15"
                disabled={isSubmitting}
                id="video-download-url"
                onChange={(event) => setUrl(event.currentTarget.value)}
                placeholder="https://example.com/video.mp4"
                required
                type="url"
                value={url}
              />
            </div>
            <Button className="h-12 rounded-xl px-5" disabled={isSubmitting || !url.trim()} type="submit">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isSubmitting ? "Adding…" : "Add download"}
            </Button>
          </div>
        </form>
      </section>

      {result && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-emerald-950 dark:text-emerald-100 sm:flex-row sm:items-center sm:justify-between" role="status">
          <div className="flex min-w-0 gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">Download added successfully</p>
              <p className="mt-1 truncate text-sm opacity-80">{result.fileName} will appear in {destinationLabel} when it finishes.</p>
            </div>
          </div>
          {managerUrl && (
            <a
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/50 dark:bg-emerald-100 dark:text-emerald-950 dark:hover:bg-white"
              href={managerUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Download Manager <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-destructive" role="alert">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Could not add the download</p>
            <p className="mt-1 text-sm opacity-85">{error}</p>
          </div>
        </div>
      )}

      <p className="mt-5 px-1 text-sm text-muted-foreground">
        Download Manager continues working if you leave this page. Completed videos appear after refreshing the library.
        {managerUrl && <> You can also <Link className="font-semibold text-foreground underline underline-offset-4" href={managerUrl}>view all downloads</Link>.</>}
      </p>
    </div>
  );
}
