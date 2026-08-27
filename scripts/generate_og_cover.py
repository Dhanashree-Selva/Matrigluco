import re
import os
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch

def parse_svg_path(d_str):
    # Tokenize commands and coordinates
    tokens = re.findall(r'([A-Za-z])|(-?[0-9]*\.?[0-9]+)', d_str)
    items = []
    for cmd, val in tokens:
        if cmd:
            items.append(cmd)
        elif val:
            items.append(float(val))
            
    vertices = []
    codes = []
    
    i = 0
    current_cmd = None
    while i < len(items):
        item = items[i]
        if isinstance(item, str):
            current_cmd = item
            i += 1
            
        if current_cmd == 'M':
            x, y = items[i], items[i+1]
            vertices.append((x, y))
            codes.append(Path.MOVETO)
            i += 2
        elif current_cmd == 'C':
            x1, y1 = items[i], items[i+1]
            x2, y2 = items[i+2], items[i+3]
            x, y = items[i+4], items[i+5]
            vertices.extend([(x1, y1), (x2, y2), (x, y)])
            codes.extend([Path.CURVE4, Path.CURVE4, Path.CURVE4])
            i += 6
        elif current_cmd == 'Z':
            vertices.append((0, 0))
            codes.append(Path.CLOSEPOLY)
            # Z doesn't have coordinates
        else:
            i += 1
            
    return Path(vertices, codes)

d = ("M24 5C30.6 5 36 10.4 36 17C36 21.2 33.8 24.9 30.5 27C29.2 25.5 28.5 23.5 28.5 21.5C28.5 17.4 25.1 14 21 14C19 14 17 14.7 15.5 16C17.6 9.7 20.4 5 24 5Z"
     "M43 24C43 30.6 37.6 36 31 36C26.8 36 23.1 33.8 21 30.5C22.5 29.2 24.5 28.5 26.5 28.5C30.6 28.5 34 25.1 34 21C34 19 33.3 17 32 15.5C38.3 17.6 43 20.4 43 24Z"
     "M24 43C17.4 43 12 37.6 12 31C12 26.8 14.2 23.1 17.5 21C18.8 22.5 19.5 24.5 19.5 26.5C19.5 30.6 22.9 34 27 34C29 34 31 33.3 32.5 32C30.4 38.3 27.6 43 24 43Z"
     "M5 24C5 17.4 10.4 12 17 12C21.2 12 24.9 14.2 27 17.5C25.5 18.8 23.5 19.5 21.5 19.5C17.4 19.5 14 22.9 14 27C14 29 14.7 31 16 32.5C9.7 30.4 5 27.6 5 24Z")

path = parse_svg_path(d)

# 1200 x 630 px output at 100 DPI
fig_w, fig_h = 12.0, 6.3
fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=100)
fig.patch.set_facecolor('#0D0B0C')
ax.set_facecolor('#0D0B0C')

# In SVG (0,0) is top-left and (48,48) is bottom-right.
# In matplotlib (0,0) is bottom-left. We map x: [0, 48] -> centered in [0, 1200], y: [0, 48] -> inverted & centered in [0, 630]
# Target logo size: 260px wide/high on 1200x630 canvas (occupies 21.6% width, ~41% height)
logo_px = 260.0
scale = logo_px / 48.0 # ~5.416 px per viewBox unit

# Center of canvas is (600, 315)
# SVG center is (24, 24)
# x_canvas = (x_svg - 24) * scale + 600
# y_canvas = 315 - (y_svg - 24) * scale

transformed_vertices = []
for vx, vy in path.vertices:
    cx = (vx - 24.0) * scale + 600.0
    cy = 315.0 - (vy - 24.0) * scale
    transformed_vertices.append((cx, cy))

transformed_path = Path(transformed_vertices, path.codes)
patch = PathPatch(transformed_path, facecolor='#F06F9D', edgecolor='none', lw=0)
ax.add_patch(patch)

ax.set_xlim(0, 1200)
ax.set_ylim(0, 630)
ax.axis('off')
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

output_dir = "web/public/brand"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "og-cover.png")

plt.savefig(output_path, format='png', dpi=100, facecolor=fig.get_facecolor(), edgecolor='none', pad_inches=0)
plt.close()

from PIL import Image
img = Image.open(output_path)
print(f"Generated OG cover at {output_path}: size={img.size}, mode={img.mode}")
