#!/usr/bin/env python3
"""Desktop shell for Personal Workbench (pywebview)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def _portable_dir() -> Path:
    if getattr(sys, "frozen", False):
        # PyInstaller onedir / onefile extract dir
        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            bundled = Path(meipass) / "portable"
            if bundled.is_dir():
                return bundled
        return Path(sys.executable).resolve().parent / "portable"
    return Path(__file__).resolve().parents[1] / "portable"


def _entry_html() -> Path:
    root = _portable_dir()
    preferred = root / "个人工作台.html"
    if preferred.is_file():
        return preferred
    index = root / "index.html"
    if index.is_file():
        return index
    raise FileNotFoundError(f"未找到工作台页面，请确认 portable 目录存在: {root}")


def main() -> int:
    parser = argparse.ArgumentParser(description="个人工作台桌面版")
    parser.add_argument(
        "--smoke-test",
        action="store_true",
        help="仅校验资源并退出（供 CI 使用）",
    )
    parser.add_argument(
        "--smoke-test-output",
        default="",
        help="smoke-test 成功时写入的标记文件路径",
    )
    args = parser.parse_args()

    html = _entry_html()
    if args.smoke_test:
        assets_js = html.parent / "assets" / "app.js"
        assets_css = html.parent / "assets" / "app.css"
        if not assets_js.is_file() or not assets_css.is_file():
            print(f"缺少 assets: {assets_js} / {assets_css}", file=sys.stderr)
            return 1
        if args.smoke_test_output:
            out = Path(args.smoke_test_output)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text("ok\n", encoding="utf-8")
        print(f"smoke-test ok: {html}")
        return 0

    import webview

    url = html.resolve().as_uri()
    webview.create_window(
        "个人工作台",
        url=url,
        width=1280,
        height=860,
        min_size=(900, 600),
    )
    webview.start()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
