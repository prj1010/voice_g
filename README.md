# Warmline

A simple way to talk with customers in Hindi, Tamil, Telugu, and English.

Warmline walks through a short phone conversation: greet, ask permission, note the amount and timing, then close the call or hand it to a person. You can try a full call in the browser.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). Pick a language, then **Try a call**.

## Run it on Render

The repo already has a [render.yaml](render.yaml) Blueprint.

1. Open [Render](https://dashboard.render.com) and sign in with the same GitHub account that owns `prj1010/voice_g`.
2. Click **New → Blueprint** (or open the existing Warmline service).
3. Pick **prj1010/voice_g**, branch `main`.
4. Render builds with `npm install --include=dev && npm run build` and starts with `npm start`.

Or create a **Web Service** by hand:

| Field | Value |
| --- | --- |
| Runtime | Node |
| Branch | `main` |
| Build command | `npm install --include=dev && npm run build` |
| Start command | `npm start` |
| Instance | Free |

Environment variables (Blueprint sets these):

| Name | Value |
| --- | --- |
| `NITRO_PRESET` | `render-com` |
| `HOST` | `0.0.0.0` |
| `NODE_VERSION` | `22` |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | `1` |

Render supplies `PORT`. You do not need a database or a `.env` file for this demo.

The first deploy takes a few minutes. The free instance sleeps after idle traffic; the next visit may wait ~30 seconds.

## What you get

- Hindi, Tamil, Telugu, and English scripts
- A sample call you can play through
- A live transcript and a small file of what was gathered
- Works in the browser — no extra accounts needed for this demo

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Type check |
