"""Generiert die QR-Codes für die GitHub-Pages-URLs nach qr-codes/."""
from pathlib import Path

import qrcode

BASE_URL = 'https://wefoth.github.io/WEBXR_ANDROID/'
OUT_DIR = Path(__file__).parent / 'qr-codes'

TARGETS = {
    'qrcode.png': BASE_URL + 'src/index.html',
}

for filename, url in TARGETS.items():
    out_path = OUT_DIR / filename
    qrcode.make(url).save(out_path)
    print(f'{url} -> {out_path}')
