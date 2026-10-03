# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

There is no test runner configured. No env vars are needed to run locally (see `.env.example`; Supabase/Gemini vars are for future weeks).

## What this is

DuHoc24, a Vietnamese-language study-abroad application portal. It is a teaching template for a 6-week course (see README.md for the week-by-week roadmap). The current state is **Week 1: static UI only** — no API routes, no database, no auth. Planned additions: Gemini chatbot (W2), Supabase + real forms/admin data (W3), document extraction (W4), Make.com automation (W5), `/login` magic-link auth (W6). Don't add `/login` or backend wiring unless asked; it is intentionally absent.

## Architecture

- **Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript.** Path alias `@/*` maps to the repo root. Check `node_modules/next/dist/docs/` before using Next APIs (see AGENTS.md); e.g. the root layout uses the global `LayoutProps<"/">` type.
- **All data is mock**, hard-coded in `lib/mock-data.ts` (types such as `DocStatus`, `RequestStatus`, `School`, plus the fixture arrays). Pages import from it directly; when wiring real data, this file is the single seam to replace. Status values are Vietnamese snake_case codes (`cho_duyet`, `hop_le`, ...) rendered via `components/status-badge.tsx`.
- **Route groups:** `/` (landing, composed from `components/landing/*`), `/portal` (student document flow, `components/portal/*`), and `/admin/*` (requests, schools, profiles, conversations). `app/admin/layout.tsx` provides the sidebar shell (`components/admin/sidebar.tsx`); `/admin` redirects to `/admin/requests`.
- **UI layer:** shadcn/ui with style `base-nova`, built on **Base UI** (`@base-ui/react`), not Radix — component APIs differ from typical shadcn examples. Primitives live in `components/ui/`; add more with the shadcn CLI (`components.json`; the `@tailark-oss` registry is configured for landing blocks). Use `cn()` from `lib/utils.ts`; animations use `motion` and `tw-animate-css`.
- Pages are server components by default; only interactive pieces (`site-header`, `quote-form`, `chat-widget`, `admin/sidebar`, some ui primitives) are `"use client"`.
- Content/UI copy is Vietnamese (`<html lang="vi">`, Be Vietnam Pro font with the vietnamese subset); keep new copy in Vietnamese. Remote images are only allowed from `images.unsplash.com` (`next.config.ts`).

## Quy tắc Git

- Luôn hỏi xác nhận trước khi push lên Github
- Không bao giờ commit file .env hoặc bất kỳ file chứa API key
