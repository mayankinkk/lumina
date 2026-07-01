# Lumina - AI Coding Rules

## Coding Standards

- Never use inline CSS. Use Tailwind CSS utility classes.
- Use JavaScript (not TypeScript) with JSDoc where helpful.
- Keep components under 250 lines.
- Prefer composition over large components.
- Use reusable hooks. Separate UI from business logic.
- Use feature-based folders: `components/{feature}/`, `app/{feature}/`.
- Add comments only where necessary. Code should be self-documenting.
- Write scalable production-quality code.
- Use shadcn/ui components when possible. Avoid reinventing UI primitives.
- Make every page responsive. Test at 320px, 768px, 1024px, and 1440px.

## Architecture

- **Framework**: Next.js 15+ with App Router (JavaScript, not TypeScript)
- **Styling**: Tailwind CSS 4+ with shadcn/ui component library
- **State**: Zustand for client-side global state
- **Persistence**: LocalStorage via Zustand middleware or custom hooks
- **Theming**: next-themes with dark/light mode support
- **AI Integration**: Server-side API routes (`/api/ai`) with environment variable keys

## Project Structure

```
lumina/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout with providers
│   ├── page.js            # Home/Dashboard
│   ├── library/           # Library page
│   ├── reader/[id]/       # PDF Reader with dynamic route
│   ├── vocabulary/        # Vocabulary Notebook
│   ├── notes/             # Highlights & Notes
│   ├── settings/          # App Settings
│   └── api/ai/            # AI API route (server-side)
├── components/
│   ├── ui/                # shadcn/ui primitives (DO NOT MODIFY)
│   ├── layout/            # Shell, Sidebar, Header, MobileNav
│   ├── home/              # Home page components
│   ├── library/           # Library page components
│   ├── reader/            # Reader components (PDF viewer, toolbar)
│   ├── vocabulary/        # Vocabulary components
│   ├── notes/             # Notes components
├── lib/
│   ├── utils.js           # cn() helper
│   ├── store.js           # Zustand global store
│   ├── sm2.js             # SM-2 spaced repetition algorithm
├── hooks/                 # Custom React hooks
└── public/                # Static assets, manifest, icons
```

## Key Conventions

- Every page uses `<ShellLayout>` for consistent navigation.
- All interactive components are `"use client"`.
- API keys are NEVER exposed to the client. Use `/api/*` routes.
- Use `useStore` (Zustand) for shared state. Avoid prop drilling.
- Prefer `<Card>`, `<Button>`, `<Input>` from shadcn/ui.
- The `cn()` utility (from `lib/utils.js`) merges Tailwind classes safely.
- Font families: `font-literata` for reading content, default sans for UI.
