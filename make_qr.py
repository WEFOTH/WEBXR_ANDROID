import qrcode
from pathlib import Path

url = 'https://wefoth.github.io/WEBXR_TEST/'
out_path = Path('qrcode.png')
img = qrcode.make(url)
img.save(out_path)
print(f'QR code saved to {out_path.resolve()}')
