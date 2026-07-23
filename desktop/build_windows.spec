# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path

from PyInstaller.utils.hooks import collect_all

block_cipher = None
desktop_dir = Path(SPECPATH).resolve()
root = desktop_dir.parent
portable = root / "portable"

datas = [
    (str(portable / "个人工作台.html"), "portable"),
    (str(portable / "assets"), "portable/assets"),
]

wv_datas, wv_binaries, wv_hidden = collect_all("webview")

a = Analysis(
    [str(desktop_dir / "app.py")],
    pathex=[str(desktop_dir)],
    binaries=wv_binaries,
    datas=datas + wv_datas,
    hiddenimports=list(wv_hidden) + ["clr", "webview"],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="个人工作台",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="个人工作台",
)
