# App Ladder

`App Ladder` is a solo-first miniapp for reviewing one Base miniapp per day and growing a private tier board over time.

It is built as one Next.js app that works in:

- Farcaster miniapp surfaces
- Base App / regular wallet browser surfaces
- Standard browsers without login

## Stack

- Next.js 14 App Router + TypeScript
- Farcaster miniapp metadata + manifest route
- Wagmi provider shell for future wallet expansion
- `localStorage` persistence for the MVP
- `next/og` image routes for icon, splash, OG, embed, and screenshots
- `html-to-image` for local PNG export

## Local setup

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env.local`

3. Start the dev server

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Environment variables

Required for real production registration:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BASE_APP_ID`
- `FARCASTER_HEADER`
- `FARCASTER_PAYLOAD`
- `FARCASTER_SIGNATURE`

Optional for later wallet expansion:

- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

## MVP behavior

- Static catalog of 12 sample miniapps
- One daily review slot keyed by `YYYY-MM-DD`
- Inputs: tier, short note, fun, polish, come back
- Latest review per miniapp powers the tier board
- Share section can export a PNG and copy cast text
- Data persists in `localStorage`

## Important placeholder values

These are intentionally left as placeholders until deployment details are known:

- `NEXT_PUBLIC_BASE_APP_ID`
- Farcaster `accountAssociation`
- Sample catalog `externalUrl` values
- ERC-8021 attribution defaults

## Production TODO

- Replace placeholder app URL, app ID, and Farcaster manifest signature values
- Replace sample catalog links with real Base miniapp destinations
- Decide whether to re-enable wallet connectors once project IDs and target wallet UX are finalized
- Register the deployed domain with Warpcast Manifest Tool
- Verify Farcaster / Base App embeds against the final production domain

## Verification commands

Commands used during implementation:

```bash
npm run lint
npm run build
```

## Notes

- Core product flow works without login or wallet connection.
- The current catalog is intentionally static so the app can stay near-zero cost.
- If browser storage is blocked or corrupt, the app shows a recovery message and keeps the core UI usable.
