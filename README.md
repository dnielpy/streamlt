# Streamlt

Streamlt is a responsive local video library built with Next.js. It scans a folder on the server, creates a searchable catalog, and streams MP4 and WebM files directly to the browser.

## Features

- Recursive local-library scanning.
- First page of 12 videos with YouTube-style infinite loading.
- Search by file name or relative folder.
- Most recently modified videos first.
- Native video playback with seeking, volume and fullscreen controls.
- HTTP range streaming for efficient seeking.
- On-demand thumbnails generated with `ffmpeg`.
- Duration metadata read with `ffprobe`.
- Download action for every video.
- Upload MP4 and WebM videos with drag-and-drop, progress tracking, and optional subfolders.
- Responsive light and dark interface.

## Run with Docker Compose

Copy the example environment file and point it at the folder containing your videos:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
VIDEO_LIBRARY_HOST_PATH=/absolute/path/to/your/videos
```

Start the server:

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000) from any device on the same local network using the server's LAN IP.

The video directory is mounted read-write so uploads can be stored from the app. Generated thumbnails are stored in the named `streamlt-cache` Docker volume. The image includes both `ffmpeg` and `ffprobe`.

## Local development

Install dependencies:

```bash
pnpm install
```

Set the server-side library path before starting Next.js:

```bash
VIDEO_LIBRARY_PATH=/absolute/path/to/your/videos \
VIDEO_CACHE_PATH=/absolute/path/to/a/writable/cache \
pnpm dev
```

For real durations and thumbnails, install `ffmpeg` locally. If it is not installed, videos still stream and the UI shows a fallback duration/thumbnail.

## Configuration

| Variable | Description | Required |
| --- | --- | --- |
| `VIDEO_LIBRARY_PATH` | Absolute server-side path containing the video library. | Yes |
| `VIDEO_CACHE_PATH` | Writable folder for generated thumbnails. | No; defaults to `.streamlt-cache`. |

Only `.mp4` and `.webm` files are included. The scanner ignores hidden files and directories and does not follow symbolic links. New or removed files appear after a page reload or a new search.

## Routes

| Route | Description |
| --- | --- |
| `/` | Searchable video library. |
| `/upload` | Upload MP4 and WebM videos to the library or a new subfolder. |
| `/watch/[videoId]` | Watch view for one local video. |
| `/api/videos` | Paginated catalog endpoint. |
| `/api/videos/[videoId]/stream` | Range-aware video stream and download endpoint. |
| `/api/videos/[videoId]/thumbnail` | Cached JPEG thumbnail endpoint. |

## Validation

```bash
pnpm lint
pnpm build
docker compose build
```
