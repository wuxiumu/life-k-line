# Life K-Line / 人生 K 线

A bilingual, open-source life timing tool with three complete modes. It runs entirely in the browser, requires no account or API key, and is ready for static deployment.

一个中英文开源人生趋势工具。包含三种完整模式，无需账户或 API Key，出生信息只在浏览器中处理。

## Three modes / 三种模式

| Mode | Purpose | 主要内容 |
| --- | --- | --- |
| Today / 今日节奏 | Build a daily reflection habit | 7 日趋势、六维状态、行动与避免事项 |
| Timeline / 人生全景 | Understand long-term cycles | 18 年、10 年、1 年趋势与年度矩阵 |
| Bonds / 关系合盘 | Explore how two people relate | 六个关系维度与未来 12 个月节奏 |

Every mode includes a complete demo. Users can explore the product before entering personal data.

## Product principles

- Demo first: show value before asking for input.
- Structured before generative: charts and scores come before narrative.
- Private by default: calculations happen locally in the browser.
- Bilingual by design: Chinese and English share data, not hard-coded pages.
- Extensible: each mode returns the versioned `ReadingResultV1` contract.
- Responsible: low scores are reset windows, not deterministic predictions.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run typecheck
npm run build
npm run preview
```

The static site is generated in `dist/`.

## Two language deployments

Use the same repository for both deployments:

```bash
VITE_DEFAULT_LOCALE=zh npm run build
VITE_DEFAULT_LOCALE=en npm run build
```

Visitors can still switch language. Shared links preserve both the selected language and mode.

Available environment variables:

```bash
VITE_DEFAULT_LOCALE=zh
VITE_REPOSITORY_URL=https://github.com/wuxiumu/life-k-line
```

## Docker

```bash
docker build --build-arg VITE_DEFAULT_LOCALE=zh -t life-k-line .
docker run --rm -p 8080:80 life-k-line
```

Open `http://localhost:8080`.

## Architecture

```text
src/
├── components/         # shared result and input components
├── views/              # Today, Timeline, and Bonds views
├── lib/engine.ts       # three local calculation plugins
├── i18n.ts             # Chinese and English product copy
├── types.ts            # ReadingResultV1 extension contract
└── App.tsx             # mode routing and share flow
```

The local engine is deterministic: the same input produces the same result. A future professional Bazi engine or AI explanation provider can implement the same result contract without changing the views.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Responsible use

Life K-Line is for entertainment and self-reflection. It does not provide medical, legal, financial, or life-decision advice.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

## License and contact

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Maintainer: [wuxiumu@163.com](mailto:wuxiumu@163.com)
