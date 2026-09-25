# Contributing

Thanks for helping improve Life K-Line.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run build
```

## Product constraints

- Keep Today, Timeline, and Bonds usable without an API key.
- Update Chinese and English copy together.
- Preserve the `ReadingResultV1` boundary between engines and views.
- Do not add deterministic medical, legal, financial, or harmful predictions.
- Keep personal data processing local unless a feature clearly discloses otherwise.
- Verify both desktop and 390px mobile layouts.

Use concise conventional commits such as `feat: add timeline dimension selector`.

By contributing, you agree that your contribution is licensed under Apache-2.0.
