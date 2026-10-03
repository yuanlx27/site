# DESIGN.zh.md

DESIGN.md 的中文排版补充约定。所有涉及中文与中西混排的规则以本文档为准；通用设计决策见 DESIGN.md。

---

## 1. 定位

- 内容以中文为主，可夹杂英文；**不做 i18n 路由**，不维护多语言版本页面。
- UI 框架文字（导航、日期线、colophon、按钮）全部使用英文。
- 通过字体栈让中英文在同一页面上视觉一致，而不是通过翻译或分流。
- `<html lang="zh-CN">`；报头、标语等纯英文片段用 `lang="en"` 标注。

## 2. 中文字体：京华老宋体

- 中文默认字体为**京华老宋体（KingHwa Old Song）**，看中的正是它的磨损、木版印刷质感。
- 通过 CDN 引入：

  ```css
  @import url("https://fontsapi.zeoseven.com/309/main/result.css");
  ```

- 该服务按 unicode-range 分片，浏览器只下载页面实际用到的字形，按需加载，体积可控。
- **这是全站唯一的第三方运行时依赖**，需在 DESIGN.md §9 的性能预算中记明。
- 必须保留系统衬线兜底栈，CDN 不可用时字形不能塌：

  ```css
  "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "SimSun", serif
  ```

## 3. 字体栈顺序（中西混排的核心规则）

拉丁字体在前、中文字体在后：英文与数字落在拉丁字体上，汉字自然回落到老宋体。

| 用途 | 字体栈 |
|---|---|
| 正文 / 标题 | `"IM Fell English", "KingHwa Old Song", "Songti SC", "Noto Serif CJK SC", serif` |
| 点缀（日期、标签、日期线） | `"Special Elite", "KingHwa Old Song", "Courier New", monospace` |
| 代码 | `"TT2020 Style E", "KingHwa Old Song", ui-monospace, monospace` |

注意：Special Elite 不含汉字，出现在打字机字体语境里的汉字（如中文标签）会回落老宋体，质感有轻微跳跃，可接受；日期一律使用数字格式规避（见 §5）。同理，TT2020 Style E 也不含汉字，代码块中的中文回落老宋体。

代码字体选型：TT2020 Style E（OFL 1.1，https://github.com/ctrlcctrlv/TT2020）是严格等宽的打字机字体，磨损适中——字形完整清晰，笔画浓淡介于 Style D（偏淡）与 Style B（偏浓）之间，与 IM Fell / 京华老宋体"保存完好的旧印刷品"气质一致。不在 Fontsource/Google Fonts 上，需手动子集化（拉丁子集 woff2 约 800KB，保留 calt 交替字形）自托管。Style F/G 磨损过重影响阅读，Special Elite 并非真正等宽，均已排除。

## 4. 排版参数

- 中文正文 `line-height`：**1.75–1.85**（高于 DESIGN.md 中英文的 1.65），字号维持 18–20px。
- 中文段落两端对齐：`text-align: justify; text-justify: inter-ideograph;`。
- 老宋体只有一个字重，**禁止浏览器合成假粗体**：标题层级靠字号和 IM Fell English SC 区分，必要时设 `font-synthesis-weight: none;`。
- 标点：中文内容使用全角标点；禁则处理（行首行尾标点）交给浏览器默认，不做额外挤压。
- `hyphens: auto` 只作用于拉丁文字，对中文无影响。
- 首字下沉（drop cap）对中文同样成立：首字放大约占 3 行，用老宋体。注意 `::first-letter` 会把段首的全角引号「"」一并放大——写作时尽量避免引号开头，或接受该效果。

## 5. 日期与数字

- 全站开启 `font-variant-numeric: oldstyle-nums`。
- 列表、meta、标签页里的日期统一 ISO 数字格式：`2026-10-03`（由 Special Elite 呈现，避免汉字混入打字机字体）。
- 报头日期线（dateline）属 UI chrome，用英文长格式：`Saturday, 3 October 2026`。

## 6. 暗色模式下的中文

- 老宋体的磨损笔画在暗底（lamplight）上偏细，必须重新校验对比度是否达到 WCAG AA；必要时在暗色令牌里把 `--ink` 再调亮一点。
- 纸张颗粒纹理在暗色下不透明度需要单独调低，避免"脏屏"感。
