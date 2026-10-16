import zlib
import struct
import math
import os

def create_png(width, height, color_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter byte None
        for x in range(width):
            r, g, b, a = color_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressor = zlib.compressobj()
    compressed = compressor.compress(raw_data) + compressor.flush()

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))

    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))

    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))

    return bytes(png)

def icon_color(x, y, w, h, is_maskable=False):
    # Normalized coords from -1 to 1
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    dist = math.sqrt(nx*nx + ny*ny)
    
    # Background gradient: Deep Indigo/Navy to Vibrant Slate
    bg_t = (ny + 1) / 2
    r_bg = int(15 * (1 - bg_t) + 30 * bg_t)
    g_bg = int(23 * (1 - bg_t) + 58 * bg_t)
    b_bg = int(42 * (1 - bg_t) + 138 * bg_t)

    # Scale icon if maskable (stay within 80% safe zone)
    scale = 0.7 if is_maskable else 0.85
    cx = nx / scale
    cy = ny / scale
    cdist = math.sqrt(cx*cx + cy*cy)

    # Draw clock ring
    if 0.55 <= cdist <= 0.78:
        # Clock ring in bright cyan/teal
        return (14, 165, 233, 255)
    
    # Clock hands: center dot
    if cdist <= 0.12:
        return (255, 255, 255, 255)
    
    # Minute hand pointing up-right
    # angle ~ 45 deg: cx > 0, cy < 0, |cx - (-cy)| < 0.08, cdist < 0.45
    if cy < 0 and cx > -0.05 and cx < 0.35 and abs(cy + cx*0.9) < 0.09 and cdist < 0.48:
        return (255, 255, 255, 255)

    # Hour hand pointing left-ish: cy ~ 0.05, cx < 0, cdist < 0.32
    if cx < 0.05 and cx > -0.32 and abs(cy - 0.0) < 0.08:
        return (56, 189, 248, 255)

    # Small resting badge / checkmark dot at bottom right
    bx = cx - 0.45
    by = cy - 0.45
    bdist = math.sqrt(bx*bx + by*by)
    if bdist <= 0.22:
        # Emerald accent
        return (16, 185, 129, 255)

    return (r_bg, g_bg, b_bg, 255)

os.makedirs('public', exist_ok=True)

# Generate icons
for size in [192, 512]:
    img_data = create_png(size, size, lambda x, y, w, h: icon_color(x, y, w, h, False))
    with open(f'public/pwa-{size}x{size}.png', 'wb') as f:
        f.write(img_data)

# Maskable 512
img_maskable = create_png(512, 512, lambda x, y, w, h: icon_color(x, y, w, h, True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(img_maskable)

# Apple touch icon 180x180
img_apple = create_png(180, 180, lambda x, y, w, h: icon_color(x, y, w, h, False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(img_apple)

# SVG Icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#glow)" stroke-width="28" stroke-linecap="round"/>
  <!-- Clock hands -->
  <line x1="256" y1="256" x2="256" y2="150" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="330" y2="256" stroke="#38bdf8" stroke-width="20" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="18" fill="#ffffff"/>
  <!-- Rest indicator leaf/badge -->
  <circle cx="360" cy="360" r="56" fill="#10b981"/>
  <path d="M344 360l12 12 24-24" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''

with open('public/icon.svg', 'w') as f:
    f.write(svg_content)

print("Icons generated successfully!")
