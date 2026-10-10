# Life K-Line / 人生 K 线

> 浏览器内完成的**人生趋势可视化**工具：今日节奏 / 人生全景等模式，无需账号与 API Key。

**定制 / 合作：** 微信 **qingbao199101**（备注：人生K线）｜ [wuxiumu@163.com](mailto:wuxiumu@163.com)

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


## 冒烟自检

```bash
bash scripts/smoke.sh
# 或 npm run smoke
```

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

## SEO 字段预留（产品页 HTML 统一生成时用）

| 字段 | 用途 |
|---|---|
| `seo_title` | `<title>` / OG title |
| `seo_description` | meta description |
| `canonical_url` | 规范 URL |
| `og_image` | 分享图 |
| `robots` | 如 `index,follow` |
| `json_ld_type` | SoftwareApplication / WebPage / FAQPage |
| `hreflang` | zh-CN / en |
| `site_name` | 白标品牌名 |

> **GEO ≠ 地理定位。** GEO = Generative Engine Optimization（生成式引擎优化），见下一节。

## GEO（生成式引擎优化）

面向 ChatGPT / Perplexity / Gemini 等生成式答案引擎的可引用结构：中文为主、双语关键词、事实摘要前置、FAQ 收尾。

### 关键词（中英）

- 中文：人生K线, 人生趋势, 日节奏, 时间可视化, 双语人生工具
- English: life k-line, life timeline, daily rhythm, bilingual life tool, static web app

### 事实摘要

- 产品：纯前端人生趋势/节奏可视化，可静态部署。
- 适合：要趣味工具页、个人品牌站小工具的人。
- 交付：可白标皮肤、文案、嵌入站点；可做传播页。
- 不做：不采集出生信息到服务器（本地处理）；非专业命理鉴定。

### FAQ

**Q：这是什么？**  
A：见事实摘要「产品」。

**Q：如何定制？**  
A：微信 `qingbao199101`，备注项目名。

**Q：是否包含密钥或付费数据？**  
A：默认不含；按各项目说明自行配置。

## 定制合作

白标皮肤、文案、嵌入你的站点/小程序 WebView。加微信备注「人生K线」。

---

## 联系方式

定制、演示或合作：

- 邮箱：[wuxiumu@163.com](mailto:wuxiumu@163.com)
- 微信：**qingbao199101**（添加请备注来意）

### 赞助支持

如果内容对你有帮助，欢迎自愿赞助。

| 微信赞赏码 | 支付宝收款码 |
|---|---|
| ![微信赞赏码](https://chiguashentan-test.oss-cn-beijing.aliyuncs.com/wxprogram/zan/20261002185236_31_227.png) | ![支付宝收款码](https://chiguashentan-test.oss-cn-beijing.aliyuncs.com/wxprogram/zan/20261002185309_32_227.jpg) |



## 下一步优化

深优化清单（文档先行，代码下一轮）：[docs/OPTIMIZATION.md](docs/OPTIMIZATION.md)
