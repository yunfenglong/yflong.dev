---
title: "Building a Terminal-Style Portfolio With Next.js"
summary: "How I structured a portfolio that feels like a local terminal while staying performant and maintainable."
date: "2026-03-01"
tags: next.js,frontend,design
published: true
---
# Why a terminal metaphor?

A terminal UI creates a clear narrative: input, response, and iteration. It also reflects how I actually work day to day, which makes the interface personal instead of decorative.

## Architecture choices

I kept the interaction model and rendering logic separate so each part remains small and testable:

- `hooks/terminal` handles state transitions and keyboard interactions.
- `lib/terminal` focuses on command registration and command execution.
- `components/terminal` handles rendering only.

## What worked well

- The command registry pattern made adding commands straightforward.
- A clear visual token system kept the UI consistent across pages.
- Boot-sequence state persisted in `sessionStorage` prevented repeated friction.

## One practical lesson

I avoided over-animating the shell. Small transitions are enough when content and response speed are already doing the heavy UX work.

```ts
const execute = (command: string) => {
  const [name, ...args] = command.trim().split(/\s+/)
  runCommand(name.toLowerCase(), args, context)
}
```

That single dispatch path became the backbone for everything interactive.
