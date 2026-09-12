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
- Netflix-style profile selection with four-digit PINs and browser-session authentication.
- Private per-profile libraries, plus an immutable Admin profile with access to every video.
- Admin profile creation, editing, avatar selection, and non-destructive deletion.
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

On first launch, Streamlt creates `VIDEO_LIBRARY_PATH/.streamlt/profiles.json` and an `Admin` profile with PIN `1816`. Change access to the host video directory accordingly; profile metadata and PIN hashes are stored there with the media library.

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

## Profiles and folders

Opening Streamlt without an active browser session shows the profile selector. Normal profiles can only see and upload to their own folder:

```text
VIDEO_LIBRARY_PATH/
├── existing-video.mp4       # Admin only
├── Alice/                   # Alice and Admin
│   └── movie.mp4
├── Family/                  # Family and Admin
└── .streamlt/
    └── profiles.json        # Hidden profile configuration
```

Admin can upload to the library root or any profile. Deleting a profile removes its access record but deliberately leaves its folder and videos intact. Renaming a profile also renames its physical folder. Sessions use an HTTP-only cookie that lasts until the browser session ends; secure cookies are enabled automatically when the request is served through HTTPS.

The four-digit PIN is intended as a household privacy control on a trusted network. There is no failed-attempt lockout, so Streamlt should not be exposed directly to the public internet.

## Routes

| Route | Description |
| --- | --- |
| `/` | Searchable video library. |
| `/profiles` | Profile selector and PIN entry. |
| `/admin/profiles` | Admin-only profile management. |
| `/upload` | Upload MP4 and WebM videos to the library or a new subfolder. |
| `/watch/[videoId]` | Watch view for one local video. |
| `/api/videos` | Paginated catalog endpoint. |
| `/api/videos/[videoId]/stream` | Range-aware video stream and download endpoint. |
| `/api/videos/[videoId]/thumbnail` | Cached JPEG thumbnail endpoint. |
| `/api/session` | Create or clear the active profile session. |
| `/api/profiles/[profileId]` | Admin-only profile update and deletion. |

## Validation

```bash
pnpm lint
pnpm test
pnpm build
docker compose build
```
