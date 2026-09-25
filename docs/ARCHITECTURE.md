# Architecture

Life K-Line separates calculation, result data, and presentation.

```text
Profile input
    ↓
InsightEngine
    ├── Today plugin
    ├── Timeline plugin
    └── Bonds plugin
    ↓
ReadingResultV1
    ↓
Shared components + mode view
```

## Result contract

`ReadingResultV1` contains engine identity, schema version, subjects, headline, dimensions, time series, key moments, insights, actions, and calculation evidence.

Views never access calculation internals. New engines should produce this contract instead of adding engine-specific fields to components.

## Adding a mode

1. Add a mode identifier and dimensions in `src/types.ts`.
2. Implement a `ReadingModePlugin` in `src/lib/engine.ts`.
3. Add bilingual semantic labels in `src/i18n.ts`.
4. Add a view under `src/views/` using shared components.
5. Add routing and sharing parameters in `src/App.tsx`.

## Adding AI

AI should explain structured results, not invent scores. Keep the local engine as the no-cost fallback and label generated interpretation separately from deterministic chart data.
