# 个人工作台

基于 [Qiang-Z/personal-workbench](https://github.com/Qiang-Z/personal-workbench) **v4.1** 的纯前端个人效率工具。打开即用，无需后端；数据默认只存在本机浏览器 / 桌面 WebView 的 localStorage。

默认导航：**今天 / 工作 / 日历 / 回顾 / 更多**。财务、科研、生活、健康、习惯、热榜可在「更多」中按需启用。

本分支 / 本仓库**只含工作台**，不含其他项目代码。

许可沿用上游：个人使用，欢迎自行修改。

---

## 三种使用方式

### 1. 便携 HTML（最轻）

用浏览器打开：

- `index.html`（仓库根目录，适合 GitHub Pages）
- 或 `portable/个人工作台.html`

### 2. Windows exe（发给同事双击即用）

不需要注册、不需要填写 GitHub。本机预览：

```bash
cd desktop
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Windows 打包可用 Actions「Build Personal Workbench Windows EXE」（若已配置），或本机 PyInstaller：

```bash
cd desktop
.venv/bin/pyinstaller build_windows.spec --noconfirm --clean
```

### 3. 在线网页（免费 GitHub Pages）

请使用**仅含本工作台的公开仓库**开启 Pages（私有仓库的 Pages 需付费）。

1. 仓库 **Settings → Pages → Build and deployment → Source**
2. 选 **Deploy from a branch**：Branch = `main`（或本分支名），Folder = `/`（根目录）
3. 保存后访问：`https://<你的用户名>.github.io/<仓库名>/`

说明：别人打开的是你的网址；每人数据仍在各自浏览器本地。

---

## 可选：Gist 多设备同步

在应用内 **更多 → 同步设置** 中，用**自己的** GitHub Token + Gist。不要共用 Token / Gist。

---

## 目录

```
index.html / assets/   # Pages 入口
portable/              # 便携版
source/                # 模块化源码
desktop/               # pywebview 桌面壳
docs/                  # 升级说明
```

重建便携版：

```bash
cd source && python3 scripts/build_portable.py
```

测试：

```bash
cd source && node --test tests/*.test.js
```
