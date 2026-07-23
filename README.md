# 个人工作台

基于 [Qiang-Z/personal-workbench](https://github.com/Qiang-Z/personal-workbench) **v4.1** 的纯前端个人效率工具。打开即用，无需后端；数据默认只存在本机浏览器 / 桌面 WebView 的 localStorage。

默认导航：**今天 / 工作 / 日历 / 回顾 / 更多**。财务、科研、生活、健康、习惯、热榜可在「更多」中按需启用。

首次打开为空白（已去掉演示种子）。若浏览器仍显示旧演示数据：F12 → Application → Local Storage → 删除 `workbench_data_v2` 后刷新。

许可沿用上游：个人使用，欢迎自行修改。

---

## 三种使用方式

### 1. 便携 HTML（最轻）

用浏览器直接打开：

`personal-workbench/portable/个人工作台.html`

适合自己用，或把整个 `portable/` 文件夹发给别人。

### 2. Windows exe（发给同事双击即用）

- **不需要**注册，**不需要**填写 GitHub，双击即可使用。
- 每人数据在自己电脑上，互不可见。
- 在本仓库 GitHub Actions 中运行 workflow **「Build Personal Workbench Windows EXE」**，下载 artifact `personal-workbench-windows`，把其中的 `个人工作台` 文件夹（含 exe）发给对方即可。

本机预览桌面窗（macOS / Windows）：

```bash
cd personal-workbench/desktop
python -m pip install -r requirements.txt
python app.py
```

### 3. 在线网页（可选，别人访问你的地址）

部署后，其他人打开的是**你的** GitHub Pages 地址，例如：

`https://<你的用户名>.github.io/<仓库名>/`

启用步骤（本仓库远程为 `katyhudson/newproject`）：

1. **先把代码推到 GitHub**（至少包含 `personal-workbench/` 与 `.github/workflows/personal-workbench-pages.yml`）
2. 打开仓库：**Settings → Pages → Build and deployment → Source**，选 **GitHub Actions**
3. 打开 **Actions** → 选 workflow **「Deploy Personal Workbench Pages」** → **Run workflow**（或 push 触发）
4. 部署成功后，用浏览器访问：

   `https://katyhudson.github.io/newproject/`

   （若仓库改名或换账号，地址变为 `https://<用户名>.github.io/<仓库名>/`）

说明：

- 别人打开的是**你的**这个网址；每人填写的记事/财务仍只存在**各自浏览器**，不会写到你的 GitHub，也不会互相看到。
- 清除浏览器站点数据会丢本地记录，重要数据请在「更多」里导出备份。

---

## 可选：Gist 多设备同步

仅在「想换电脑还保留数据」时需要。在应用内 **更多 → 同步设置** 中，用**自己的** GitHub Token + Gist 配置。

- 不要把 Token 发给别人
- 不要多人共用同一个 Gist（会互相覆盖）
- 单机使用完全可以不配置

---

## 目录结构

```
personal-workbench/
  portable/                 # 浏览器 / Pages / exe 内嵌页面
  source/                   # 模块化源码
  desktop/                  # pywebview 桌面壳 + PyInstaller
  docs/v4.1_升级说明.md
```

重新打包便携版：

```bash
cd personal-workbench/source
python scripts/build_portable.py
```

跑源码测试：

```bash
cd personal-workbench/source
node --test tests/*.test.js
```

---

## 数据安全提示

- 默认不上传服务器；Pages 只托管静态页面。
- 换电脑 / 重装系统前请导出 JSON，或配置自己的 Gist。
- exe 与浏览器、在线版的 localStorage **默认不互通**，需自行导出导入或靠 Gist。
