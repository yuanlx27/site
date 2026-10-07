---
title: "Pi Agent 1.0"
description: "以极简闻名的 Agent Harness，发布了它的第一个“正式版”。"
pubDate: 2026-10-03T04:11:16.631Z
tags: ["ai", "agent", "pi"]
draft: false
---

前段时间，[Earendil](https://earendil.com) 发布了 [Pi 1.0](https://earendil.com/posts/pi-1-0) 和 [Pi Durable](https://earendil.com/posts/pi-durable)。一直以来，Pi 以它极简主义的设计哲学闻名。相比起 Claude Code、Codex、OpenCode 这类有着诸多繁重预设的 Agent，Pi [有意地](https://mariozechner.at/posts/2025-11-30-pi-coding-agent)把 Harness 简化到了只包含那些最基础最必要的部分：模型接入，`AGENTS.md` 和 Skills，对话历史，还有简约的 TUI 界面。

它没有 `/goal` 和 `/plan`，没有 Restricted Mode，甚至[没有 MCP](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp)。但它有官方的插件市场，任何人都可以随心所欲地把 Pi 自定义成他们想要的样子，这一点与 DeepSeek Harness 的“一切皆插件”的理念颇有相似之处。也是靠着这一点，Pi 获得了很多开发者的青睐。

然而，Pi 1.0 却加入了以下更新：[^1]
- Codemode (native support for MCP, and non-LLM models like Jev and image models)
- Extension support for virtual models
- Deferred tool loading
- Cache warming for anthropic models
- Mid-conversation system messages (transcript-aware prompt and tool changes)
- A new TUI theme
- Full-screen mode by default

这里面有些东西似乎和它之前的理念相悖。究竟是否如此，我们不妨说道说道。

# Codemode

如果你在更新之后用过 Pi，你多半会发现它的 `tool` 模式变了。以前，在 Pi 运行的时候，我们能看到 `read` 和 `write` 这样的工具调用块，现在则是被 codemode 里的 `tools.read` 和 `tools.write` 调用替代。Codemode 使得 Pi 能够批量地调用工具，并且把它们的输入输出接入更复杂的工作流。有点类似管道之于 Shell，单个 Shell 脚本功能强大但单一[^2]，但是管道可以把它们的输入输出串联起来，从而实现很多复杂的功能。

当然，codemode 并没有真正取代原来的 `read` 和 `write`，模型仍然可以按照原来的方式调用它们，只是默认偏好变成了 codemode。如果你是一个“恋旧”的人，可以在 Pi 的配置文件里这样写：

```json
{
  "defaultTools": ["+codemode"],
  "codemode": {
    "mode": "only"
  }
}
```

## 原生支持 MCP

事实证明，MCP 是很有用的。有用到让 Pi 的开发者们能为了它打破自己之前的坚持。

# 扩展支持虚拟模型

现在扩展可以注册某种更复杂的自定义“虚拟模型”，比如我的某个扩展提供一个 `gpt-auto` 模型，对于简单的任务，它会调用 `gpt-6.1-sol`；但是对于比较复杂的任务，它调用的是 `gpt-6-astra`，更高效地使用 token。之所以叫“虚拟模型”，是因为我们提供的东西本质上是一个类似于路由器的机制，而不是真实的模型。

# 工具按需加载

由于现在引入了 MCP 支持，可能因此多出大量的 tool，所以 Pi 把 tool 的加载从之前的对话一开始就把 tool 名称和描述放到模型的上下文里改成了模型主动通过 `tool_search` 查询 tool 信息，从而节约上下文。

# Anthropic 模型缓存保温

优化了使用 Anthropic API 的模型的缓存机制。

# 会话中途更新系统指令与工具

现在 system prompt 和 tool 也进入了 Pi 的树形会话记录，可以随会话分支一同切换。

# 新的 TUI 主题

新增了根据终端配色生成 Pi 配色的 `system` 主题。

# 默认启用全屏模式

最后这个全屏模式，其实旧版本里就有，只是一直作为实验性功能，默认不开启。开启之后，如果你在一个长对话里上下滚动，你会看到一个细滚动条。它是 Pi 用字符渲染的，跟你的终端无关。如果不开启全屏模式，Pi 渲染界面就是通过计算出终端的大小之后直接一行一行地输出字符，这时候滚动是由终端负责的；开启之后则是 Pi 固定地输出终端大小的 viewport，类似视频里一帧一帧的画面。这个改动使得 Pi 能够渲染像滚动条这样更复杂的 UI 元素。

[^1]: 摘自 [Earendil 的公告](https://earendil.com/posts/pi-1-0)。

[^2]: 它们通常遵循 Unix 哲学：“Do one thing and do it well”。
