# Streamlt

Streamlt is a responsive personal video library built with Next.js. It provides a clean, YouTube-inspired interface for browsing a collection of videos and opening each one in a dedicated watch view.

The project currently uses mock data and direct video paths, but its structure is ready to connect to a backend that supplies real video metadata and media URLs.

## Features

### Video library

- Responsive video grid on the home page.
- Thumbnail, title, duration, view count, and publication date for each video.
- Keyboard-focusable video cards linking to the dedicated watch view.
- Responsive layout for mobile, tablet, and desktop screens.

### Watch view

Each video is available at `/watch/[videoId]`.

- Native HTML5 video playback using the video's `path`.
- Existing thumbnail used as the video poster.
- Custom controls for play/pause, seeking, elapsed time, volume, mute, and fullscreen.
- Smooth progress updates while the video is playing.
- Error state when a media path cannot be loaded.
- Download action next to the video title.
- “Up next” list with links to the remaining videos.
- Sticky player and independently scrollable recommendations on large screens.
- The global sidebar is hidden on watch pages so the player and recommendations have more space.

### Global interface

- Streamlt branding and navigation bar.
- Search field UI in the application header.
- Light and dark theme toggle.
- Home navigation through the logo and sidebar.
- Accessible labels, focus states, and keyboard-friendly controls.

## Routes

| Route | Description |
| --- | --- |
| `/` | Video library home page. |
| `/watch/[videoId]` | Dedicated video player and “Up next” view. |
| Unknown routes | Next.js not-found page. |

Example watch URL:

```text
/watch/morning-mountains
```

## Video data model

Videos are currently defined in `src/modules/list/data/mock-videos.ts` and follow this shape:

```ts
type Video = {
  id: string;
  title: string;
  views: string;
  publishedAt: string;
  duration: string;
  thumbnail: string;
  path: string;
};
```

`path` must point to a browser-playable media resource, such as an MP4 or WebM file. It can be either a relative path or an absolute URL:

```ts
{
  id: "morning-mountains",
  title: "A Peaceful Morning in the Mountains",
  views: "125K views",
  publishedAt: "3 days ago",
  duration: "12:34",
  thumbnail: "https://example.com/thumbnail.jpg",
  path: "/videos/morning-mountains.mp4",
}
```

The mock collection uses `DEFAULT_VIDEO_PATH` as a temporary playable source. Replace that value, or provide a different `path` for each video, when real media data is connected.

## Project structure

```text
src/
├── app/
│   ├── page.tsx                     # Video library home route
│   ├── watch/[videoId]/page.tsx     # Dynamic watch route
│   ├── layout.tsx                   # Root metadata and application shell
│   └── globals.css                  # Theme tokens and range-control styles
├── components/
│   └── common/video-card.tsx        # Reusable video card
└── modules/
    ├── layout/                     # Header, sidebar, theme, and shell
    ├── list/                       # Video grid, types, and mock data
    └── watch/                      # Player, watch view, and Up next list
```

## Tech stack

- Next.js `16.3.4` with the App Router.
- React `19.2.8`.
- TypeScript.
- Tailwind CSS v4.
- `next-themes` for theme switching.
- `lucide-react` for interface icons.
- pnpm for package management.

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
pnpm dev      # Start the development server
pnpm lint     # Run ESLint
pnpm build    # Create a production build
pnpm start    # Start the production server
```

## Media and external assets

- Video playback is handled by the browser's native `<video>` element.
- MP4 and WebM direct media paths are supported by the current player.
- HLS streams (`.m3u8`) are not supported yet.
- Thumbnails currently use remote Unsplash images configured in `next.config.ts`.
- Downloads use the `video.path` URL. For cross-origin media, the server must allow the download and may need a `Content-Disposition` response header.

## Current limitations

- The video collection is static mock data; there is no backend or database yet.
- The search field is currently presentational and is not connected to filtering.
- The theme toggle changes the interface theme but does not persist server-side user settings.
- There is no authentication, upload flow, playlist management, or watch-history persistence.
- The player does not yet include subtitles, playback speed, picture-in-picture, theater mode, or HLS support.

## Validation

The current project can be checked with:

```bash
pnpm lint
pnpm build
```

Both commands should complete successfully before handing off changes.
