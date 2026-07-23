# 个人工作台

基于 [Qiang-Z/personal-workbench](https://github.com/Qiang-Z/personal-workbench) **v4.1** 的纯前端个人效率工具。打开即用，无需后端；数据默认只存在本机浏览器的 localStorage。

默认导航：**今天 / 工作 / 日历 / 回顾 / 更多**。财务、科研、生活、健康、习惯、学习、热榜可在「更多」中按需启用。

「学习」模块支持：**阶段练习**（子模块 + 外链按钮）与 **课程列表**（文章卡片点击跳转）。

首次打开为空白（已去掉演示种子）。若浏览器仍显示旧演示数据：F12 → Application → Local Storage → 删除 `workbench_data_v2` 后刷新。

许可沿用上游：个人使用，欢迎自行修改。

---

## 使用方式

### 1. 便携 HTML

用浏览器打开：

`personal-workbench/portable/个人工作台.html`

或把整个 `portable/` 文件夹发给别人。

### 2. 在线网页

公开仓 Pages 地址：

**https://katyhudson.github.io/personal-workbench/**

别人打开的是你的网址；每人数据仍在各自浏览器本地。

改源码后重建并推送到公开仓 `main` 即可更新在线版。

---

## 可选：Gist 多设备同步

在应用内 **更多 → 同步设置** 中，用**自己的** GitHub Token + Gist。不要共用 Token / Gist。单机使用可不配置。

---

## 目录结构

```
personal-workbench/
  portable/                 # 浏览器 / Pages 入口
  source/                   # 模块化源码（在这里改）
  docs/v4.1_升级说明.md
```

重新打包便携版：

```bash
cd personal-workbench/source
python3 scripts/build_portable.py
```

跑源码测试：

```bash
cd personal-workbench/source
node --test tests/*.test.js
```

---

## 数据安全提示

- 默认不上传服务器；Pages 只托管静态页面。
- 换电脑前请导出 JSON，或配置自己的 Gist。
